/* @flow */

import validator from 'email-validator';
import passwordValidator from 'password-validator';

export function checkUsername(username : string) : boolean {
    return (/^[a-z0-9_]{6,16}$/i).test(username);
}

export function checkPassword(password : string) : boolean {
    let schema = new passwordValidator();
    schema.is().min(8)
        .has().uppercase()
        .has().lowercase()
        .has().digits();

    return schema.validate(password);
}

export function checkEmail(email : string) : boolean {
    return validator.validate(email);
}

export function validate(req : Object, res : Object, next : Function) : mixed {
    if (req.body.username) {
        if (!checkUsername(req.body.username)) {
            return res.status(400).send({ error: 'Invalid username' });
        }
    }

    if (req.body.email) {
        if (!checkEmail(req.body.email)) {
            return res.status(400).send({ error: 'Invalid email address' });
        }
    }

    next();
}

