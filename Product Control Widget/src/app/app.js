import DashboardAddons from 'hub-dashboard-addons';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {render} from 'react-dom';
import Select from '@jetbrains/ring-ui/components/select/select';
import Panel from '@jetbrains/ring-ui/components/panel/panel';
import Button from '@jetbrains/ring-ui/components/button/button';

import './app.css';
import {Input} from "@jetbrains/ring-ui/components/input/input";
import DatePicker from "@jetbrains/ring-ui/components/date-picker/date-picker";
import Alert, {Container} from "@jetbrains/ring-ui/components/alert/alert";
import ErrorBubble from "@jetbrains/ring-ui/components/error-bubble/error-bubble";


const DEFAULT_VACATION = "HT_NA-14";
const DEFAULT_SICK_LEAVE = "HT_NA-15";
const DEFAULT_SICK_DAY = "HT_NA-17";
const DEFAULT_OWN_EXPENSE = "HT_NA-16";
const DEFAULT_TITLE = "Product Control Widget";
let serviceId = "";

class Widget extends Component {
  static propTypes = {
    dashboardApi: PropTypes.object,
    registerWidgetApi: PropTypes.func
  };

  constructor(props) {
    super(props);
    const {registerWidgetApi, dashboardApi} = props;

    this.state = {
      isConfiguring: false,
      alerts: []
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
        vacation: config.vacation,
        sickLeave: config.sickLeave,
        sickDay: config.sickDay,
        ownExpense: config.ownExpense,
        title: config.title
      });
    });
  }

  saveConfig = async () => {
    const {vacation, sickLeave, sickDay, ownExpense, title} = this.state;
    await this.props.dashboardApi.storeConfig({
      vacation,
      sickLeave,
      sickDay,
      ownExpense,
      title
    });
    this.setState({isConfiguring: false});
  };

  cancelConfig = async () => {
    this.setState({isConfiguring: false});
    await this.props.dashboardApi.exitConfigMode();
    this.initialize(this.props.dashboardApi);
  };
  changeVacation = e => this.setState({
    vacation: e.target.value
  });
  changeSickLeave = e => this.setState({
    sickLeave: e.target.value
  });
  changeSickDay = e => this.setState({
    sickDay: e.target.value
  });
  changeOwnExpense = e => this.setState({
    ownExpense: e.target.value
  });
  changeTitle = e => this.setState({
    title: e.target.value
  });
  setRange = ({from, to}) => {
    this.setState({from, to});
  };
  changeOption = selectedLeave => this.setState({selectedLeave});

  renderConfiguration() {
    const {vacation, sickLeave, sickDay, ownExpense, title} = this.state;

    return (
      <div className="widget">
        <Input
          label="Название виджета"
          onChange={this.changeTitle}
          value={title ?? DEFAULT_TITLE}

        />
        <Input
          label="id карточки отпуска"
          onChange={this.changeVacation}
          value={vacation ?? DEFAULT_VACATION}
        />
        <Input
          label="id карточки болезни"
          onChange={this.changeSickLeave}
          value={sickLeave ?? DEFAULT_SICK_LEAVE}
        />
        <Input
          label="id карточки сикдэя"
          onChange={this.changeSickDay}
          value={sickDay ?? DEFAULT_SICK_DAY}
        />
        <Input
          label="id карточки ухода за свой счет"
          onChange={this.changeOwnExpense}
          value={ownExpense ?? DEFAULT_OWN_EXPENSE}
        />
        <Panel>
          <Button primary onClick={this.saveConfig}>{'Save'}</Button>
          <Button onClick={this.cancelConfig}>{'Cancel'}</Button>
        </Panel>
      </div>
    );
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

  render() {
    const {title, ownExpense, sickDay, sickLeave, vacation, selectedLeave, from, to, isConfiguring} = this.state;

    this.props.dashboardApi.setTitle(title ?? DEFAULT_TITLE);

    if (isConfiguring) {
      return this.renderConfiguration();
    }
    let selectData = [];
    vacation ? selectData.push({key: vacation, label: 'Отпуск'}) : selectData.push({
      key: DEFAULT_VACATION,
      label: 'Отпуск'
    });
    sickLeave ? selectData.push({key: sickLeave, label: 'Болезнь'}) : selectData.push({
      key: DEFAULT_SICK_LEAVE,
      label: 'Болезнь'
    });
    sickDay ? selectData.push({key: sickDay, label: 'Сикдэй'}) : selectData.push({
      key: DEFAULT_SICK_DAY,
      label: 'Сикдэй'
    });
    ownExpense ? selectData.push({key: ownExpense, label: 'За свой счет'}) : selectData.push({
      key: DEFAULT_OWN_EXPENSE,
      label: 'За свой счет'
    });
    selectedLeave ? selectedLeave.key = selectData.filter(x => x.label === selectedLeave.label)[0].key : {};

    return (
      <div className="widget">
        <div><DatePicker anchor = 's' from={from} to={to} onChange={this.setRange} range/></div>
        <div>
          <Select
            data={selectData}
            selected={selectedLeave}
            onChange={this.changeOption}
            label="Выберети тип отсутствия"
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

  addWorkItems = (issueId, missedDays, serviceId) => {
    let minutesADay = '';
    let dashboardApi=this.props.dashboardApi;
    dashboardApi.fetch(serviceId, 'rest/admin/timetracking').then(response => {
      minutesADay = response.minutesADay;
      let resultError = '';
      let returnedPromises = 0;

      let promise = new Promise(function (resolve, reject) {
        for (let i = 0; i < missedDays; i++) {
          dashboardApi.fetch(serviceId, `rest/issue/${issueId}/timetracking/workitem`, {
            method: 'POST',
            body: {
              date: Date.now(),
              duration: minutesADay
            }
          }).then(workItem => {
            returnedPromises++;
            if (returnedPromises === missedDays) {
              resolve('Отсутсвие успешно отражено.');
            }
          }).catch(error => {
            returnedPromises++;
            resultError += `Error acquired on adding ${i + 1} work item:\n${JSON.stringify(error.data.value)}\n`;
            if (returnedPromises === missedDays) {
              reject(resultError);
            }

          });
        }
      }).then(resultText => {
          let newAlerts = this.state.alerts;
          newAlerts.push({
            type: Alert.Type.SUCCESS,
            key: `${Date.now()}`,
            message: `${resultText}`
          });
          this.setState({alerts: newAlerts})
        }
      ).catch(err => {
        let newAlerts = this.state.alerts;
        newAlerts.push({
          type: Alert.Type.ERROR,
          key: `${Date.now()}`,
          message: `При треке отстуствия призошли следующие ошибки:${err}`
        });
        this.setState({alerts: newAlerts})
      });
    }).catch(response => {
      let newAlerts = this.state.alerts;
      newAlerts.push({
        type: Alert.Type.ERROR,
        key: `${Date.now()}`,
        message: {response}
      });
      this.setState({alerts: newAlerts})
    })
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
        let missedDays = (Date.parse(to) - Date.parse(from)) / (1000 * 3600 * 24);
        this.addWorkItems(selectedLeave.key, missedDays, serviceId);
      }
    }
  };

}

DashboardAddons.registerWidget((dashboardApi, registerWidgetApi) => {
    dashboardApi.fetchHub('api/rest/services').then(response => serviceId = response.services[0].id);
    render(
      <Widget
        dashboardApi={dashboardApi}
        registerWidgetApi={registerWidgetApi}
      />,
      document.getElementById('app-container')
    );
  }
);
