import DashboardAddons from 'hub-dashboard-addons';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {render} from 'react-dom';
import Select from '@jetbrains/ring-ui/components/select/select';
import Panel from '@jetbrains/ring-ui/components/panel/panel';
import Button from '@jetbrains/ring-ui/components/button/button';
import trashIcon from '@jetbrains/icons/trash.svg';
import './app.css';
import DatePicker from "@jetbrains/ring-ui/components/date-picker/date-picker";
import Alert, {Container} from "@jetbrains/ring-ui/components/alert/alert";
import Text from "@jetbrains/ring-ui/components/text/text";
import Icon from "@jetbrains/ring-ui/components/icon";
import {Grid} from "@jetbrains/ring-ui";
import Row from "@jetbrains/ring-ui/components/grid/row";
import Col from "@jetbrains/ring-ui/components/grid/col";
import Input from "@jetbrains/ring-ui/components/input/input";

const DEFAULT_TITLE = "Отметить отсутствие";
let serviceId = "";
let workTypes = [];

class Widget extends Component {
  static propTypes = {
    dashboardApi: PropTypes.object,
    registerWidgetApi: PropTypes.func
  };

  constructor(props) {
    super(props);
    const {registerWidgetApi, dashboardApi} = props;

    this.state = {
      selectedLeave: null,
      isConfiguring: false,
      alerts: [],
      settingsAlerts: [],
      vacations: []
    };

    registerWidgetApi({
      onConfigure: () => this.setState({isConfiguring: true})
    });

    this.initialize(dashboardApi);
  }

  initialize(dashboardApi) {
    dashboardApi.readConfig().then(config => {
      if (!config) {
        return;
      }
      this.setState({
        vacations: config.vacations,
        workType: config.workType,
        issueId: config.issueId,
        title: config.title
      });
    });
  }

  saveConfig = async () => {
    const {workType, issueId, title, vacations} = this.state;
    await this.props.dashboardApi.storeConfig({
      vacations,
      workType,
      issueId,
      title
    });
    this.setState({isConfiguring: false});
  };

  cancelConfig = async () => {
    this.setState({isConfiguring: false});
    await this.props.dashboardApi.exitConfigMode();
    this.initialize(this.props.dashboardApi);
  };
  changeWorkType = workType => this.setState({
    workType
  });
  changeIssueId = e => this.setState({
    issueId: e.target.value
  });
  changeTitle = e => this.setState({
    title: e.target.value
  });
  setRange = ({from, to}) => {
    this.setState({from, to});
  };
  changeOption = selectedLeave => this.setState({selectedLeave});

  addItem = () => {
    let {workType, issueId, vacations} = this.state;
    if (!workType || !issueId) {
      let newAlerts = this.state.settingsAlerts;
      newAlerts.push({
        type: Alert.Type.ERROR,
        key: `${Date.now()}`,
        message: `Выберите work type и введите issue id`
      });
      this.setState({settingsAlerts: newAlerts})

    } else {
      if (!vacations.filter(x => x.label === workType.label)[0]) {

        vacations.push({key: issueId, label: workType.label});
        this.setState({vacations});

      } else {
        let newAlerts = this.state.settingsAlerts;
        newAlerts.push({
          type: Alert.Type.ERROR,
          key: `${Date.now()}`,
          message: `Данный work type уже присутствует в списке`
        });
        this.setState({settingsAlerts: newAlerts})
      }
    }


  };
  deleteItem = (label) => {
    let {vacations, selectedLeave} = this.state;
    if (selectedLeave !== null && label === selectedLeave.label) {
      this.setState({selectedLeave: null})
    }
    this.setState({vacations: vacations.filter(x => x.label !== label)});
  };

  /*inputChange = e=>(label)=>{
    let vacations = this.state.vacations;
    let a = vacations.filter(x=>x.label===label)[0];
    a.key=e.target.value;
    this.setState({vacations});
  }*/
  renderConfiguration() {
    const {workType, issueId, title, vacations} = this.state;

    return (
      <div className="widget">
        <Input
          label="Название виджета"
          onChange={this.changeTitle}
          value={title ?? DEFAULT_TITLE}
        />
        <Panel>
          <Grid>
            {vacations.map(x =>
              <div key={JSON.stringify(x)}>
                <Row>
                  <Col xs={4} sm={4} md={6} lg={3}>
                    <div className="cell">{x.label}</div>
                  </Col>
                  <Col xs={4} sm={8} md={6} lg={3}>
                    <div className="cell">{x.key}</div>
                  </Col>
                  <Col xs={4} smOffset={4} sm={8} md={12} lg={6}>
                    <div className="cell"><Button onClick={() => this.deleteItem(x.label)}> <Icon
                      glyph={trashIcon}
                      className="ring-icon"
                      color={Icon.Color.RED}
                    />️</Button></div>
                  </Col>
                </Row>
              </div>)}
          </Grid>
        </Panel>
        <Panel>
          <Text>{"Work type"}</Text>
          <br/>
          <Select
            data={workTypes}
            selected={workType}
            onChange={this.changeWorkType}
            label={"Work type"}
          />

          <Input
            label={"Issue id"}
            onChange={this.changeIssueId}
            value={issueId}
          />

          <Button onClick={this.addItem}>{'Добавить пару'}</Button>
        </Panel>

        <Panel>
          <Button primary onClick={this.saveConfig}>{'Сохранить'}</Button>
          <Button onClick={this.cancelConfig}>{'Отменить'}</Button>
        </Panel>
        <div>
          <Container>
            {this.state.settingsAlerts.map(alert => {
              const {message, key, type, isClosing} = alert;
              return (
                <Alert
                  key={key}
                  type={type}
                  isClosing={isClosing}
                  onCloseRequest={() => this.onCloseSettingsAlertClick(alert)}
                  onClose={() => this.onCloseSettingsAlert(alert)}
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

  onCloseSettingsAlert = closedAlert => {
    this.setState(prevState => ({
      settingsAlerts: prevState.settingsAlerts.filter(alert => alert !== closedAlert)
    }));
  };
  onCloseSettingsAlertClick = alert => {
    const alertToClose = this.state.settingsAlerts.filter(it => alert.key === it.key)[0];
    alertToClose.isClosing = true;
    this.setState({
      settingsAlerts: this.state.settingsAlerts
    });
  };
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

  render() {
    const {title, vacations, selectedLeave, from, to, isConfiguring} = this.state;

    this.props.dashboardApi.setTitle(title ?? DEFAULT_TITLE);

    if (isConfiguring) {
      return this.renderConfiguration();
    }

    return (
      <div className="widget">

        <div><DatePicker rangePlaceholder={"Выберите период"} from={from} to={to} onChange={this.setRange} range/></div>
        <div>
          <Select
            data={vacations}
            selected={selectedLeave}
            onChange={this.changeOption}
            label="Выберите тип отсутствия"
          />
        </div>
        <br/>

        <div><Button primary onClick={this.track}>{'Отметить отсутствие'}</Button></div>
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

  getDate = (dateString)=>
  {
    let date = new Date(dateString);
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
  };

  addWorkItems = async (issueId, serviceId, workType, from, to) => {
    let wstate = this;
    const minutesADay = 8 * 60;
    let dashboardApi = this.props.dashboardApi;
    let workItemDate = this.getDate(from);
    let toDate = this.getDate(to);
    toDate.setDate(toDate.getDate() + 1);
    let resultError = '';
    let newAlerts = this.state.alerts;
    let loadingAlert = {
      type: Alert.Type.LOADING,
      key: `${Date.now()}`,
      message: `Идет трек отсутствия...`,
      isClosing: false
    };
    newAlerts.push(loadingAlert);
    this.setState({alerts: newAlerts});
    do {
      /*newAlerts.push({type: Alert.Type.WARNING, key: `${Date.now()}`, message: `${workItemDate}`});
      wstate.setState({alerts: newAlerts});*/
      await dashboardApi.fetch(serviceId, `rest/issue/${issueId}/timetracking/workitem`, {
        method: 'POST',
        body: {
          date: Date.parse(workItemDate),
          duration: minutesADay,
          worktype: {
            name: workType
          }
        }
      }).then(workItem => {
      }).catch(error => {
        resultError += `Error acquired on adding work item:\n${JSON.stringify(error)}\n`;
      });
      workItemDate.setDate(workItemDate.getDate() + 1);
    } while (workItemDate.toString() !== toDate.toString());

    if (resultError === "") {
      loadingAlert.isClosing = true;
      this.setRange({from: null, to: null});
      this.changeOption(null);
      newAlerts.push({
        type: Alert.Type.SUCCESS,
        key: `${Date.now()}`,
        message: `${'Отсутствие успешно отражено.'}`
      });
      this.setState({alerts: newAlerts});
    } else {
      loadingAlert.isClosing = true;
      newAlerts.push({
        type: Alert.Type.ERROR,
        key: `${Date.now()}`,
        message: `При треке отсутствия произошли следующие ошибки:${resultError}`
      });
      this.setState({alerts: newAlerts})
    }
  };
  track = () => {
    const {from, to, selectedLeave} = this.state;
    if (!selectedLeave) {
      let newAlerts = this.state.alerts;
      newAlerts.push({
        type: Alert.Type.ERROR,
        key: `${Date.now()}`,
        message: 'Выберите тип отсутствия'
      });
      this.setState({alerts: newAlerts})
    } else {
      if (!from || !to) {
        let newAlerts = this.state.alerts;
        newAlerts.push({
          type: Alert.Type.ERROR,
          key: `${Date.now()}`,
          message: 'Выберите дату'
        });
        this.setState({alerts: newAlerts})
      } else {
        this.addWorkItems(selectedLeave.key, serviceId, selectedLeave.label, from, to);
      }
    }
  };

}

DashboardAddons.registerWidget((dashboardApi, registerWidgetApi) => {
    dashboardApi.fetchHub('api/rest/services').then(response => {
      serviceId = response.services.filter(x => x.id !== '0-0-0-0-0')[0].id;
      dashboardApi.fetch(serviceId, 'rest/admin/timetracking/worktype').then(response => workTypes = response.map(x => {
        return {label: x.name, key: x.name}
      }));
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
