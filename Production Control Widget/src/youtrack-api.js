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
    document.getElementById('debug').value += `${config.baseUrl} ${config.token} ${missedDays} ${issueId}`;


    let resultError = '';
    let addedWorkItems = 0;
    for (let i = 0; i < missedDays; i++) {
        youtrack.workItems.create(issueId, {
            duration: {
                presentation: '1d'
            }
        }).then(workItem => {
            addedWorkItems++;
        }).catch(error => {
            resultError += `Error acquired on adding ${i + 1} work item:\n${error}\n`;
        });
    }

    resultError === ''
        ? document.getElementById('error').value = `Отсутствие успешно отражено`
        : document.getElementById('error').value = `${addedWorkItems} work items были успешно добавлены, произошли следующие ошибки\n${resultError}`;
};