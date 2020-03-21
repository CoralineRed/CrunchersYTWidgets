const {Youtrack} = require('youtrack-rest-client');

function addWorkItems(baseUrl, token, issueId, missedDays) {
    const config = {
        baseUrl: baseUrl,
        token: token
    };
    const youtrack = new Youtrack(config);
    document.getElementById('debug').value = `${config.baseUrl} ${config.token} ${youtrack} ${missedDays} ${issueId}`
    /*for (let i = 0; i < missedDays; i++) {
        youtrack.workItems.create(issueId, {
            duration: {
                presentation: '1d'
            }
        }).then(workItem => {
            console.log({workItem});
        }).catch(error => {
        });
    }*/

}
module.exports(addWorkItems);