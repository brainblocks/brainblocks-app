/* @flow */
export function checkEmail(email : string) : boolean {
    let allowedEmails = process.env.EMAILS;

    if (!allowedEmails) {
        return false;
    } else {
        allowedEmails = allowedEmails.split(',');
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
