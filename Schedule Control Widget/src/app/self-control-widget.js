import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button, ButtonGroup, DatePicker, Group, Panel, Text} from "@jetbrains/ring-ui";
import Select from '@jetbrains/ring-ui/components/select/select';
import Report from "./report";
import Island, {Header, Content} from "@jetbrains/ring-ui/components/island/island";
import trashIcon from '@jetbrains/icons/trash.svg';
import Icon from "@jetbrains/ring-ui/components/icon";
import {getReportData} from "./api-interaction";
import {getFromToDateObj, periodsData} from "./date-helper";
import QueryAssist from "@jetbrains/ring-ui/components/query-assist/query-assist";
import Alert from "@jetbrains/ring-ui/components/alert/alert";
import {Input} from "@jetbrains/ring-ui/components/input/input";

export default class SelfControlWidget extends Component {
    //TODO:test
    static propTypes = {
        dashboardApi: PropTypes.object,
        registerWidgetApi: PropTypes.func,
        throwAlert: PropTypes.func,
        closeAlert: PropTypes.func,
        userId:PropTypes.string
    };

    constructor(props) {
        super(props);
        this.state = {
            isReportReady: false,
            chosenEmployees: [],
            reportData: [],
            projects: [],
            selectedProject: null,
            selectedProjects: [],
            selectedPeriod: null,
            selectedPeriods: [],
            from: null,
            to: null,
            serviceId: null,
            workTypes: [],
            selectedWorkTypes: [],
            selectedWorkType: null
        }
    };


    async componentDidMount() {
        let serviceId = null;
        await this.props.dashboardApi.fetchHub("rest/services").then(servicesPage => {
            serviceId = servicesPage.services.filter(service => service.name === "YouTrack")[0].id;
            this.setState({serviceId});
        }).catch(err => props.throwAlert(JSON.stringify(err), Alert.Type.ERROR));
        await this.props.dashboardApi.fetch(serviceId, "rest/admin/timetracking/worktype").then(workTypePage => {
            this.setState({
                workTypes: workTypePage.map(workType => {
                    return {label: workType.name, key: workType.name}
                })
            })
        }).catch(err => props.throwAlert(JSON.stringify(err), Alert.Type.ERROR));

        this.props.dashboardApi.fetch(serviceId, "api/users/me?fields=login,email,fullName")
            .then(user => {
                this.setState({
                    chosenEmployees: [{
                        label: user.email,
                        key: {userEmail: user.email, userLogin: user.login, fullName: user.fullName}
                    }]
                })
            }).then(
            this.props.dashboardApi.fetch(serviceId, "rest/project/all").then(returnedProjects => {
                let projects = returnedProjects.filter(project => project.name !== "Global").map(project => {
                    return {label: project.name, key: project.shortName}
                });
                this.setState({projects})
            })).catch(err => props.throwAlert(JSON.stringify(err), Alert.Type.ERROR));

    }

    canCreate = () => {
        const {chosenEmployees, selectedPeriods} = this.state;
        return chosenEmployees.length !== 0 && selectedPeriods.length !== 0
    };


    check = () => {
        const props = this.props;
        const alert = this.props.throwAlert("Идет подготовка отчета", Alert.Type.LOADING);
        getReportData(this.props.dashboardApi, this.state,this.props.userId)
            .then(reportData => {
                    props.closeAlert(alert);
                    props.throwAlert("Отчет готов", Alert.Type.SUCCESS);
                    this.setState({
                        reportData,
                        isReportReady: true
                    })
                }
            ).catch(err => props.throwAlert(JSON.stringify(err), Alert.Type.ERROR));

    };
    closeReport = () => this.setState({isReportReady: false});
    selectPeriod = selectedPeriod => {
        this.setState({selectedPeriod});
        this.addPeriod(selectedPeriod);
    };
    addPeriod = period => {
        const {selectedPeriods} = this.state;
        if (!period) {
            return
        }
        if (!selectedPeriods.filter(selectedPeriod => selectedPeriod.label === period.label)[0]) {
            selectedPeriods.push(period);
            this.setState(selectedPeriods);
        } else {

        }
    };
    setRange = ({from, to}) => {
        this.setState({from, to});
        if (from && to) {
            let fromDate = new Date(from);
            let toDate = new Date(to);
            this.setState({from: null, to: null});
            this.addPeriod({
                label: `${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`,
                getPeriod: () => getFromToDateObj(fromDate, toDate)
            })
        }
    };
    deletePeriod = (period) => this.setState({selectedPeriods: this.state.selectedPeriods.filter(selectedPeriod => selectedPeriod.label !== period.label)});

    selectProject = selectedProject => {
        this.setState(selectedProject);
        const {selectedProjects} = this.state;
        if (!selectedProject) {
            return
        }
        if (!selectedProjects.filter(project => project.key === selectedProject.key)[0]) {
            selectedProjects.push(selectedProject);
            this.setState(selectedProject);
        } else {

        }
    };
    deleteProject = (project) => this.setState({selectedProjects: this.state.selectedProjects.filter(selectedProject => selectedProject.key !== project.key)});

    selectWorkType = selectedWorkType => {
        this.setState(selectedWorkType);
        const {selectedWorkTypes} = this.state;
        if (!selectedWorkType) {
            return
        }
        if (!selectedWorkTypes.filter(workType => workType.label === selectedWorkType.label)[0]) {
            selectedWorkTypes.push(selectedWorkType);
            this.setState({selectedWorkTypes});
        } else {

        }
    };
    deleteWorkType = (workType) => this.setState({selectedWorkTypes: this.state.selectedWorkTypes.filter(selectWorkType => selectWorkType.label !== workType.label)});

    dataSource = props => {
        const {serviceId} = this.state;
        const params = {
            query: {
                ...props,
                fields: `query,caret,styleRanges(length,start,style,title),suggestions(auxiliaryIcon,caret,className,completionEnd,completionStart,description,group,icon,matchingEnd,matchingStart,option,prefix,suffix)`
            }
        };
        return this.props.dashboardApi.fetch(`${serviceId}`, `api/search/assist?$top=-1&fields=${params.query.fields}`, {
            method: "POST",
            body: {
                query: params.query.query,
                caret: params.query.caret,
                folders: params.query.hasOwnProperty("folders") ? params.query.folders : []
            }
        });
    };
    accept = issueFilter => {
        this.setState({issueFilter: issueFilter.query});
        console.log(this.state.issueFilter);
    };
    changeTitle = e => this.setState({
        title: e.target.value
    });
    DEFAULT_TITLE = "Schedule Control Report";

    render() {
        const {title, isReportReady, reportData, projects, selectedProject, selectedProjects, selectedPeriod, selectedPeriods, from, to, selectedWorkType, selectedWorkTypes, workTypes, issueFilter} = this.state;
        this.props.dashboardApi.setTitle(title ?? this.DEFAULT_TITLE);
        return (
            <div>
                {!isReportReady
                    ?
                    <div>
                        <Content>
                            <strong>{"Название репорта:"}</strong>
                            <Input
                                onChange={this.changeTitle}
                                value={title ?? this.DEFAULT_TITLE}
                            />
                            <strong>{"Issue Filter:"}</strong>
                            <QueryAssist
                                query={issueFilter}
                                placeholder="Введите фильтр и нажмите Enter"
                                glass
                                clear
                                onApply={this.accept}
                                focus
                                dataSource={this.dataSource}
                            />
                        </Content>
                        <Content>
                            <strong>{"Выбор Worktype:"}</strong>
                            <div>
                                <Group>
                                    <Select
                                        filter
                                        label={"Выберите worktype"}
                                        onChange={this.selectWorkType}
                                        selected={selectedWorkType}
                                        data={workTypes}
                                    />
                                    {
                                        selectedWorkTypes == false ?
                                            <Text>{"или все worktype будут рассмотрены"}</Text>
                                            : <ButtonGroup>
                                                {
                                                    selectedWorkTypes.map(workType =>
                                                        <Button key={workType.key}
                                                                onClick={() => this.deleteWorkType(workType)}>
                                                            {workType.label + " "}<Icon
                                                            glyph={trashIcon}
                                                            className="ring-icon"
                                                            color={Icon.Color.RED}
                                                        />
                                                        </Button>)
                                                }
                                            </ButtonGroup>
                                    }
                                </Group>
                            </div>
                        </Content>

                        <Content>
                            <strong>{"Выбор проекта:"}</strong>
                            <div>
                                <Group>
                                    <Select
                                        filter
                                        label={"Выберите проект"}
                                        onChange={this.selectProject}
                                        selected={selectedProject}
                                        data={projects}
                                    />
                                    {
                                        selectedProjects == false ?
                                            <Text>{"или Issue из всех проектов будут рассмотрены"}</Text>
                                            : <ButtonGroup>
                                                {
                                                    selectedProjects.map(project =>
                                                        <Button key={project.key}
                                                                onClick={() => this.deleteProject(project)}>
                                                            {project.label + " "}<Icon
                                                            glyph={trashIcon}
                                                            className="ring-icon"
                                                            color={Icon.Color.RED}
                                                        />
                                                        </Button>)
                                                }
                                            </ButtonGroup>
                                    }
                                </Group>
                            </div>
                        </Content>
                        <Content>
                            <strong>{"Выбор периодов:"}</strong>
                            <div>
                                <Group>
                                    <Select
                                        data={periodsData}
                                        label={"Периоды"}
                                        selected={selectedPeriod}
                                        onChange={this.selectPeriod}
                                    />
                                    <Text>{"Или"}</Text>
                                    <DatePicker
                                        rangePlaceholder={"Фиксированный период"} from={from} to={to}
                                        onChange={this.setRange}
                                        range
                                    />
                                </Group>
                            </div>
                            <br/>
                            <div>
                                {
                                    selectedPeriods == false ?
                                        <Text style={{color: "red"}}>{"Выберите период"}</Text>
                                        : <ButtonGroup>
                                            {
                                                selectedPeriods.map(period =>
                                                    <Button key={period.label}
                                                            onClick={() => this.deletePeriod(period)}>
                                                        {period.label + " "}<Icon
                                                        glyph={trashIcon}
                                                        className="ring-icon"
                                                        color={Icon.Color.RED}
                                                    />
                                                    </Button>
                                                )
                                            }
                                        </ButtonGroup>
                                }
                            </div>
                        </Content>
                        <Panel>
                            <Button disabled={!this.canCreate()} onClick={this.check}>Создать отчет</Button>
                        </Panel>
                    </div>
                    :
                    <div>
                        <Button onClick={this.closeReport}>Закрыть отчет</Button>

                        <Report reportData={reportData} registerWidgetApi={this.props.registerWidgetApi}
                                dashboardApi={this.props.dashboardApi}
                                refreshReport={(() => getReportData(this.props.dashboardApi, this.state))}
                                calculatedTime={Date.now()}/>
                    </div>}
            </div>
        );
    }
}
