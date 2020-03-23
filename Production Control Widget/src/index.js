import {addWorkItems} from "./youtrack-api";
import DashboardAddons from "hub-dashboard-addons";

let DEFAULT_TITLE = "Production Control Widget";
let DEFAULT_VACATION = "HT_NA-14";
let DEFAULT_SICK_LEAVE = "HT_NA-15";
let DEFAULT_SICK_DAY = "HT_NA-17";
let DEFAULT_OWN_EXPENSE = "HT_NA-16";

function renderForm(dashboardAPI) {
    dashboardAPI.readConfig().then(function (config) {
        document.getElementById('vacation-option').value = (config && config.vacationIssueId) || DEFAULT_VACATION;
        document.getElementById('sick-leave-option').value = (config && config.sickLeaveIssueId) || DEFAULT_SICK_LEAVE;
        document.getElementById('sick-day-option').value = (config && config.sickDayIssueId) || DEFAULT_SICK_DAY;
        document.getElementById('own-expense-option').value = (config && config.ownExpenseIssueId) || DEFAULT_OWN_EXPENSE;
    });

    document.getElementById('track').onclick = function () {
        dashboardAPI.readConfig().then(function (config) {
                debugger
                if (!config || config.token === "" || !config.token) {
                    document.getElementById('error').value += 'Токен не введен в настройках';
                } else {
                    let fromDate = Date.parse(document.getElementById('from').value)
                    let toDate = Date.parse(document.getElementById('to').value);
                    let missedDays = (toDate - fromDate) / (1000 * 3600 * 24);
                    let selectElement = document.querySelector('#leave-types');
                    let issueId = selectElement.options[selectElement.selectedIndex].getAttribute('value');

                    addWorkItems(`https://${location.host}/youtrack`, config.token, issueId, missedDays)
                }


            }
        );


    }
    ;
    document.getElementById('settings').hidden = true;
    document.getElementById('leave-form').hidden = false;
}

function renderSettings(dashboardAPI) {
    debugger
    document.getElementById('settings').hidden = false;
    document.getElementById('leave-form').hidden = true;

    document.getElementById('save').onclick = function () {
        let token = document.getElementById('token').value;
        let title = document.getElementById('title').value;
        let vacationIssueId = document.getElementById('vacation').value;
        let sickLeaveIssueId = document.getElementById('sick-leave').value;
        let sickDayIssueId = document.getElementById('sick-day').value;
        let ownExpenseIssueId = document.getElementById('own-expense').value;
        dashboardAPI.storeConfig({
            token: token,
            title: title,
            vacationIssueId: vacationIssueId,
            sickLeaveIssueId: sickLeaveIssueId,
            sickDayIssueId: sickDayIssueId,
            ownExpenseIssueId: ownExpenseIssueId
        });
        dashboardAPI.exitConfigMode();
        dashboardAPI.setTitle(title);
        renderForm(dashboardAPI)
    };

    document.getElementById('cancel').onclick = function () {
        dashboardAPI.exitConfigMode();
        renderForm(dashboardAPI);
    };
}

function fillFieldsFromConfig(dashboardAPI) {
    dashboardAPI.readConfig().then(function (config) {
        debugger
        document.getElementById('token').value = (config && config.token) || "";
        document.getElementById('title').value = (config && config.title) || DEFAULT_TITLE;
        document.getElementById('vacation').value = (config && config.vacationIssueId) || DEFAULT_VACATION;
        document.getElementById('sick-leave').value = (config && config.sickLeaveIssueId) || DEFAULT_SICK_LEAVE;
        document.getElementById('sick-day').value = (config && config.sickDayIssueId) || DEFAULT_SICK_DAY;
        document.getElementById('own-expense').value = (config && config.ownExpenseIssueId) || DEFAULT_OWN_EXPENSE;
    });
}

DashboardAddons.registerWidget(function (dashboardAPI, registerWidgetAPI) {
    renderForm(dashboardAPI);

    registerWidgetAPI({
        onConfigure: function () {
            fillFieldsFromConfig(dashboardAPI);
            renderSettings(dashboardAPI);
        },
        onRefresh: function () {
            dashboardAPI.setLoadingAnimationEnabled(true);
            renderForm(dashboardAPI);
            dashboardAPI.setLoadingAnimationEnabled(false);
        }
    });
});
