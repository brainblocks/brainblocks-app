/* @flow */

import validator from 'validator';
import passwordValidator from 'password-validator';
import { RaiFunctions } from 'rai-wallet';

export function hex2bin(hex : string) : boolean {
    const hexRegEx = /([0-9]|[a-f])/gim;
    return typeof hex === 'string' && (hex.match(hexRegEx) || []).length === hex.length;
}

export function isValidJSON(json : string) : boolean {
    try {
        JSON.parse(json);
    } catch (err) {
        return false;
    }
    return true;
}

export function checkLabel(label : string) : boolean {
    return (/^[a-z0-9_ ]{1,16}$/i).test(label);
}

export function checkCurrency(currency : string) : boolean {
    return (/^([a-z]){2,4}$/).test(currency);
}

export function checkUsername(username : string) : boolean {
    if (username.indexOf('@') !== -1) {
        return (/^[a-z0-9_]{6,16}$/i).test(username.split('@')[0]) && checkLabel(username.split('@')[1]);
    }
    return (/^[a-z0-9_]{6,16}$/i).test(username);
}

export function checkPassword(password : string) : Promise<boolean> {
    let schema = new passwordValidator();
    schema.is().min(8)
        .has().uppercase()
        .has().lowercase()
        .has().digits();

    return schema.validate(password);
}

export function checkEmail(email : string) : Promise<boolean> {
    return validator.isEmail(email);
}

export function checkNanoAddress(addr : string) : boolean {
    return RaiFunctions.parseXRBAccount(addr);
}

export function checkHex(str : string) : boolean {
    return (/^[0-9A-Fa-f]+$/).test(str);
}

// @todo - this plus add to validate function
export function checkWalletCipher(wallet : string) : boolean {
    return checkHex(wallet);
}

export function checkNames(name : string) : boolean {
    // should find a way to minimally validate names
    // at least just removing special characters
    // then maybe escaping it too?
    // https://softwareengineering.stackexchange.com/questions/330512/name-validation-best-practices
    return name ? true : true;
}

export function checkDate(date : mixed, beforeThan : ?Date, afterThan : ?Date) : boolean {
    if (!validator.isInt(date) && validator.toDate(date) === null) {
        return false; // neither unix or date
    }

    if (beforeThan) {
        if (!validator.isBefore(date, beforeThan)) {
            return false;
        }
    }

    if (afterThan) {
        if (!validator.isAfter(date, afterThan)) {
            return false;
        }
    }

    return true;
}

// eslint-disable-next-line complexity
export function validate(req : Object, res : Object, next : Function) : mixed {
    if (req.body.username) {
        if (!checkUsername(req.body.username) && (req.body.username !== 'ty')) { // enabled ty's username
            return res.status(400).send({ error: 'Invalid username' });
        }
    }

    if (req.body.email) {
        if (!checkEmail(req.body.email)) {
            return res.status(400).send({ error: 'Invalid email address' });
        }
    }

    if (req.body.firstName) {
        let toValidate = req.body.firstName;
        req.body.firstName = validator.escape(req.body.firstName);
        if (req.body.lastName) {
            toValidate += req.body.lastName;
            req.body.lastName = validator.escape(req.body.lastName);
        } else {
            req.body.lastName = null;
        }

        if (!checkNames(toValidate)) {
            return res.status(400).send({ error: 'Invalid first or last name' });
        }

    } else {
        req.body.lastName = null;
        req.body.firstName = null;
    }

    if (req.body.birthday) {
        if (!checkDate(req.body.birthday, new Date(Date.now()))) {
            return res.status(400).send({ error: 'Invalid birthday date' });
        }
    } else {
        req.body.birthday = null;
    }

    if (req.body.wallet) {
        if (!checkWalletCipher(req.body.wallet)) {
            return res.status(400).send({ error: 'Invalid wallet cipher' });
        }
    }

    if (req.body.label) {
        if (!checkLabel(req.body.label)) {
            return res.status(400).send({ error: 'Invalid label name' });
        }
    }

    if (req.body.nanoAddress) {
        if (!checkNanoAddress(req.body.nanoAddress)) {
            return res.status(400).send({ error: 'Invalid Nano address' });
        }
    }

    if (req.body.hash) {
        const hash = req.body.hash;
        if ((hash.length !== 64) || !hex2bin(hash)) {
            return res.status(400).send({ error: 'Invalid Nano hash' });
        }
    }

    if (req.body.accounts) {
        for (let account of Object.keys(req.body.accounts)) {
            if (!RaiFunctions.parseXRBAccount(account)) {
                return res.status(400).send({ error: 'Invalid Nano address' });
            }
        }
    }

    if (req.body.hash && req.body.block) {
        const hash = req.body.hash;
        const block = req.body.block;

        if ((hash.length !== 64) || !hex2bin(hash)) {
            return res.status(400).send({ error: 'Invalid Nano hash' });
        }

        if (!isValidJSON(block)) {
            return res.status(400).send({ error: 'Invalid Block JSON' });
        }
    }

    if (req.body.preferredCurrency) {
        if (!checkCurrency(req.body.preferredCurrency)) {
            return res.status(400).send({ error: 'Invalid currency' });
        }
    }

    next();
}
