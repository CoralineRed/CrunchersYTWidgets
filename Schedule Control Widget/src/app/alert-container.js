import Alert, {Container} from "@jetbrains/ring-ui/components/alert/alert";
import React, {Component} from "react";
import PropTypes from "prop-types";

export default class SelfControlWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {alerts: [],}
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
    return (
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
    );
  }
}
