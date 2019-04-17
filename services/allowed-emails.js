/* @flow */
import fs from 'fs';
import util from 'util';

// Convert fs.readFile into Promise version of same
const readFile = util.promisify(fs.readFile);

export async function checkEmail(email : string) : Promise<boolean> {

    let allowedEmails;

    allowedEmails = await readFile('./emails.json');
    allowedEmails = JSON.parse(allowedEmails.toString()).emails;

    if (!allowedEmails) {
        console.log(allowedEmails);
        console.log('no allowedEmails');
        return false;
    }

    // Find the our `@` delimiter
    let delimiterIndex = email.indexOf('@');

    // If there is no `@`, return `null` as with `str.split`
    if (delimiterIndex === -1) {
        console.log('does not have @');
        return false;
    }

    const domain = email.slice(delimiterIndex + 1);

    if (domain === 'brainblocks.io') {
        return true;
    } else if (allowedEmails.includes(email)) {
        return true;
    } else {
        return false;
    }
}
