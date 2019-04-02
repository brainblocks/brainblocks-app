/* @flow */
export const allowedEmails = [
    'mochatest@bb.io',
    'mochatest@mochatest.fave',
    'chippy3669@gmail.com'
];

export function checkEmail(email : string) : boolean {
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
