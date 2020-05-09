import DashboardAddons from 'hub-dashboard-addons';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {default as ReactDOM, render} from 'react-dom';
import './app.css';
import ManagerWidget from "./manager-widget";
import SelfControlWidget from "./self-control-widget";
import Alert, {Container} from "@jetbrains/ring-ui/components/alert/alert";

const jetbrainsReadUserPermissionKey = "jetbrains.jetpass.user-read";

export default class Widget extends Component {
    static propTypes = {
        dashboardApi: PropTypes.object,
        registerWidgetApi: PropTypes.func
    };

    constructor(props) {
        super(props);
        this.state = {isManager: false, didMount: false, alerts: [], userId: ""};
    }

    async componentDidMount() {
        const {dashboardApi} = this.props;
        let myRoles = [];
        let roles = [];
        let myUserId = "";
        await dashboardApi.fetchHub("rest/users/me")
            .then(user => {
                myUserId = user.id;
                myRoles = [...new Set([].concat(user.projectRoles, user.transitiveProjectRoles, user.sourcedProjectRoles).map(role => role.role.key))]
            })
            .catch(err => {
                this.throwAlert(JSON.stringify(err), Alert.Type.ERROR)
            });
        await dashboardApi.fetchHub("rest/roles")
            .then(rolesPage => roles = rolesPage.roles
                .map(role => {
                    return {key: role.key, permissions: role.permissions.map(permission => permission.key)}
                })
                .filter(role => role.permissions.includes(jetbrainsReadUserPermissionKey))
                .map(role => role.key))
            .catch(err => {
                this.throwAlert(JSON.stringify(err), Alert.Type.ERROR)
            });
        this.setState({isManager: myRoles.some(role => roles.includes(role)), didMount: true, userId: myUserId})
    }

    onCloseAlert = closedAlert => {
        this.setState(prevState => ({
            alerts: prevState.alerts.filter(alert => alert !== closedAlert)
        }));
    };

    onCloseAlertClick = alert => {
        const alertToClose = this.state.alerts.filter(it => alert.key === it.key)[0];
        alertToClose.isClosing = true;
        this.setState({
            alerts: this.state.alerts
        });
    };
    throwAlert = (message, type) => {
        const newAlerts = this.state.alerts;
        const alert = {
            type: type,
            key: `${Date.now()}`,
            message: message
        };
        newAlerts.push(alert);
        this.setState({alerts: newAlerts});
        return alert;
    };
    closeAlert = (alert) => {
        alert.isClosing = true;
        this.setState(this.state.alerts);
    };

    render() {
        const {isManager, didMount} = this.state;

        if (!didMount) {
            return <div className="widget">
                <text>loading...</text>
                <div>
                    <Container>
                        {this.state.alerts.map(alert => {
                            const {message, key, type, isClosing} = alert;
                            return (
                                <Alert
                                    key={key}
                                    type={type}
                                    isClosing={isClosing}
                                    onCloseRequest={() => this.onCloseAlertClick(alert)}
                                    onClose={() => this.onCloseAlert(alert)}
                                >
                                    {message}
                                </Alert>
                            );
                        })}
                    </Container>
                </div>
            </div>
        }
        if (isManager) {
            return <div className="widget">
                <ManagerWidget
                    dashboardApi={this.props.dashboardApi}
                    registerWidgetApi={this.props.registerWidgetApi}
                    throwAlert={this.throwAlert.bind(this.state)}
                    closeAlert={this.closeAlert.bind(this.state)}
                    userId={this.state.userId}
                />
                <div>
                    <Container>
                        {this.state.alerts.map(alert => {
                            const {message, key, type, isClosing} = alert;
                            return (
                                <Alert
                                    key={key}
                                    type={type}
                                    isClosing={isClosing}
                                    onCloseRequest={() => this.onCloseAlertClick(alert)}
                                    onClose={() => this.onCloseAlert(alert)}
                                >
                                    {message}
                                </Alert>
                            );
                        })}
                    </Container>
                </div>
            </div>
        }
        return (
            <div className="widget">
                <SelfControlWidget
                    dashboardApi={this.props.dashboardApi}
                    registerWidgetApi={this.props.registerWidgetApi}
                    throwAlert={this.throwAlert.bind(this.state)}
                    closeAlert={this.closeAlert.bind(this.state)}
                    userId={this.state.userId}
                />

                <div>
                    <Container>
                        {this.state.alerts.map(alert => {
                            const {message, key, type, isClosing} = alert;
                            return (
                                <Alert
                                    key={key}
                                    type={type}
                                    isClosing={isClosing}
                                    onCloseRequest={() => this.onCloseAlertClick(alert)}
                                    onClose={() => this.onCloseAlert(alert)}
                                >
                                    {message}
                                </Alert>
                            );
                        })}
                    </Container>
                </div>
            </div>
        );
    }
}

DashboardAddons.registerWidget((dashboardApi, registerWidgetApi) => {
        registerWidgetApi({
            onRefresh: () => {
                ReactDOM.unmountComponentAtNode(document.getElementById('app-container'));
                render(
                    <Widget
                        dashboardApi={dashboardApi}
                        registerWidgetApi={registerWidgetApi}
                    />,
                    document.getElementById('app-container')
                );
            }
        });
        render(
            <Widget
                dashboardApi={dashboardApi}
                registerWidgetApi={registerWidgetApi}
            />,
            document.getElementById('app-container')
        );
    }
);
