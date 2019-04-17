/* @flow */
import fs from 'fs';

export function checkEmail(email : string) : boolean {

    let allowedEmails;

    fs.exists('./emails.json', (exists) => {
        if (exists) {
            fs.readFile('./emails.json', (err, data) => {
                if (err) {
                    throw err;
                }
                allowedEmails = JSON.parse(data.toString());
                allowedEmails = allowedEmails.emails;
            });
        }
    });

    if (!allowedEmails) {
        return false;
    }

    // Find the our `@` delimiter
    let delimiterIndex = email.indexOf('@');

    // If there is no `@`, return `null` as with `str.split`
    if (delimiterIndex === -1) {
        return false;
    }

    const domain = email.slice(delimiterIndex + 1);

    if (domain === 'brainblocks.io') {
        return true;
    } else if (allowedEmails.includes(email)) {
        return true;
    }

    return false;
}
