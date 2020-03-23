/*
var a = require('youtrack-rest-client');
*/

function addWorkItems(baseUrl, token, issueId, missedDays) {
    const config = {
        baseUrl: 'https://kpfu-net.myjetbrains.com/youtrack/',
        token: 'perm:SGlraXJhbmdp.NTUtMQ==.I2eImce9O240eZbvUSC6Pfx3QNKYOY'
    };
    document.getElementById('debug').value = `${config.baseUrl} ${config.token}  ${missedDays} ${issueId}`
       /* define(['youtrack-rest-client'], function (dynModules) {
            require(dynModules, function () {
                let youtrack = new dynModules.Youtrack(config);
                for (let i = 0; i < 1; i++) {
                    youtrack.workItems.create('2WES-2', {
                        duration: {
                            presentation: '1d'
                        }
                    }).then(workItem => {
                        document.getElementById('debug').value = workItem;
                    }).catch(error => {
                        document.getElementById('debug').value = error;
                    });
                }


            });*/



}
