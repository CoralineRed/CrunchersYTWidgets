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
    let work = '';
    let addedWorkItems = 0;

    for (let i = 0; i < missedDays; i++) {
        youtrack.workItems.create(issueId, {
            duration: {
                presentation: '1d'
            }
        }).then(workItem => {
            work += `${workItem}\n`;
            addedWorkItems++;
        }).catch(error => {
            resultError += `Error acquired on adding ${i + 1} work item:\n${error}\n`;
        });
    }

    //document.getElementById('debug').value = `${work}\n${JSON.stringify(youtrack)}\n${JSON.stringify(youtrack.workItems)}`;
    document.getElementById('error').innerText = `${addedWorkItems} work items были успешно добавлены, произошли следующие ошибки\n${resultError}`;
};