import {getUtc} from "./date-helper";
import {get1cData} from "./back-end-interaction";
import Alert from "@jetbrains/ring-ui/components/alert/alert";

export const getReportData = async (dashboardApi, widgetState, userId, throwAlert) => {
    const {serviceId, issueFilter, workTypes, selectedWorkTypes, projects, selectedProjects, selectedPeriods, isReportForMyself} = widgetState;
    let {chosenEmployees} = widgetState;
    let workItems = [];
    let promises = [];
    const filterWorkTypes = selectedWorkTypes.length === 0 ? workTypes : selectedWorkTypes;
    const projectsToRequest = selectedProjects.length === 0 ? projects : selectedProjects;
    let fromToPeriods = selectedPeriods.map(period => {
        return {label: period.label, from: period.getPeriod().from, to: period.getPeriod().to}
    });
    if (isReportForMyself) {
        await dashboardApi.fetch(serviceId, "api/users/me?fields=login,email,fullName")
            .then(user => {
                chosenEmployees = [{
                    label: user.email,
                    key: {userEmail: user.email, userLogin: user.login, fullName: user.fullName}
                }];
            })
    }

    for (const project of projectsToRequest) {
        await dashboardApi.fetch(serviceId, `rest/issue/byproject/${project.key}?${issueFilter ? `filter=${encodeURIComponent(issueFilter)}` : ""}&with=id&max=30000`).then(issues => {
            issues.forEach(issue =>
                promises = promises.concat(dashboardApi.fetch(serviceId, `rest/issue/${issue.id}/timetracking/workitem`)
                    .then(returnedWorkItems => {
                        workItems = workItems.concat(returnedWorkItems.filter(workItem => {
                            return !workItem.worktype && filterWorkTypes === workTypes ||
                                filterWorkTypes.filter(fwt => fwt.label === workItem.worktype?.name)[0];
                        }).map(workItem => {
                            const date = getUtc(new Date(workItem.date));
                            const inPeriods = fromToPeriods.filter(period => period.from <= date && period.to >= date);
                            const author = chosenEmployees.filter(emp => emp.key.userLogin === workItem.author.login)[0];
                            if (!author) {
                                return;
                            }
                            const emp = chosenEmployees.filter(emp => {
                                return emp.key.userLogin === workItem.author.login
                            })[0];
                            return {
                                email: emp.label,
                                fullName: emp.key.fullName,
                                date: date,
                                inPeriods: inPeriods,
                                duration: workItem.duration / 60
                            }
                        })
                            .filter(workItem => workItem && workItem.inPeriods.length !== 0));
                    })));
        });
    }
    await Promise.all(promises);
    const plan = await get1cData(chosenEmployees.map(emp => emp.label), fromToPeriods, userId).catch(err => throwAlert("в запросе", Alert.Type.ERROR));
    workItems.forEach(workItem => {
        const user = plan.users.filter(user => user.email === workItem.email)[0];
        if (!user) {
            return;
        }
        const periods = user.periods.filter(period => workItem.inPeriods.filter(WIPeriod => WIPeriod.from.toISOString() === period.from && WIPeriod.to.toISOString() === period.to)[0]);
        periods.forEach(period => {
            period.hasOwnProperty("fact") ? period.fact += workItem.duration : period.fact = workItem.duration;

        });
    });
    plan.users.forEach(user => {
        const emp = chosenEmployees.filter(emp => emp.label === user.email)[0];
        user.fullName = emp ? emp.key.fullName : "нет в факте";
    });
    return plan.users;
};
