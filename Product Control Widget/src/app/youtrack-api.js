import Alert from "@jetbrains/ring-ui/components/alert/alert";

/*
const addWorkItems = (issueId, missedDays, fetch, serviceId,alerts) => {
  alerts=[{
    type: Alert.Type.SUCCESS,
    key: `${Date.now()}`,
    message: `${this.state.selectedLeave.key},${this.state.to}, ${this.state.from},${missedDays},${serviceId} `
  }]

  /!*let minutesADay = '';
  fetch(serviceId, 'rest/admin/timetracking').then(response => {
    minutesADay = response.minutesADay;
    let resultError = '';
    let returnedPromises = 0;
    let promise = new Promise(function (resolve, reject) {
      for (let i = 0; i < missedDays; i++) {
        fetch(serviceId, `rest/issue/${issueId}/timetracking/workitem`, {
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
        document.getElementById('error').innerText = `${resultText}`;

      }
    ).catch(err => {
      document.getElementById('error').innerText = ` При треке отсутствия произошли следующие ошибки:\n${err}`;
    });
  }).catch(response => document.getElementById('error').innerText = JSON.stringify(response))*!/
};
*/
