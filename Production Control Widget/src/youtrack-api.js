import {Youtrack} from "youtrack-rest-client";

export const addWorkItems = (baseUrl, token, issueId, missedDays) => {
    const config = {
        /*perm:SGlraXJhbmdp.NTUtMg==.rTc6rtYs47KUCp9ktdZBE8F24b14FT*/
        //'perm:cm9vdA==.NDctMA==.5w6zeB6Y3Ox2n5b2aho7343yrPs2hq'
        //'https://crunchers.myjetbrains.com/youtrack'
        baseUrl: baseUrl,
        token: token
    };

    const youtrack = new Youtrack(config);


    let resultError = '';
    let returnedPromises = 0;
    let promise = new Promise(function (resolve, reject) {
        for (let i = 0; i < missedDays; i++) {
            youtrack.workItems.create(issueId, {
                duration: {
                    presentation: '1d'
                }
            }).then(workItem => {
                returnedPromises++;
                if (returnedPromises === missedDays) {
                    resolve('Отсутсвие успешно отражено.');
                }
            }).catch(error => {
                returnedPromises++;
                resultError += `Error acquired on adding ${i + 1} work item:\n${error.error.error}\n`;
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
};