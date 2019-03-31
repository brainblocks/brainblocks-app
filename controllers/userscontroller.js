/* @flow */
import { Op } from 'sequelize';

import { checkPassword } from '../middleware/validator';
import { checkEmail } from '../services/allowed-emails';
import models from '../models';
import SuccessResponse from '../responses/success_response';
import ErrorResponse from '../responses/error_response';
import Recaptcha from '../services/recaptcha';

const { User, Contact, TempAddress, Account, AuthorizedIp } = models.models;
let exp = {};

exp.create = async (req : Object, res : Object) => {
    const error = new ErrorResponse(res);
    const success = new SuccessResponse(res);
    const { password, recaptcha, email, username } = req.body || {};

    // Validate all of the inputs
    if (!email) {
        return error.badRequest('Email is required');
    }

    if (!checkEmail(email)) {
        return error.badRequest('Registration for this email is not allowed');
    }

    if (!username) {
        return error.badRequest('Username is required');
    }

    if (!password) {
        return error.badRequest('Password is required');
    }

    if (process.env.ENFORCE_RECAPTCHA === 'true') {
        if (!recaptcha) {
            return error.badRequest('Recaptcha is required');
        }
        // Ensure the recaptcha is valid
        if (!await Recaptcha.verify(recaptcha)) {
            return error.forbidden('Invalid Recaptcha');
        }
    }

    // check if password is strong enough
    if (!checkPassword(password)) {
        return error.badRequest('Password should be at least 8 characters long and contain uppercase, lowercase and digits');
    }

    // check if username or email are taken
    const existingUser = await User.findOne({ where: {
        // eslint-disable-next-line object-shorthand
        [Op.or]: [ { email: email }, { username: username } ]
    } });

    if (existingUser !== null) {
        return error.badRequest('Username or email already taken');
    }

    // create user
    let create = {
        username:  req.body.username,
        email:     req.body.email,
        password:  req.body.password,
        firstName: req.body.firstName,
        lastName:  req.body.lastName,
        birthday:  req.body.birthday
    };

    const user = await User.create(create);
    const token = await user.generateAuthToken();

    await user.sendVerificationEmail();

    return success.send({
        status:  'success',
        token:   token.getJWT().toString(),
        expires: token.expires,
        user:    await user.getPublicData()
    });
};

exp.getUser = async (req : Object, res : Object) => {
    return res.status(200).send({ user: await req.user.getPublicData(), status: 'success' });
};

exp.update = (req : Object, res : Object) => {
    // ensure authorization
    if (!req.user) {
        return res.status(401).send({ error: 'Not authorized' });
    }

    // editable fields
    if (!req.body.preferredCurrency && !req.body.defaultAccount) {
        return res.status(401).send({ error: 'Invalid parameters' });
    }

    const options = { fields: [] };

    if (req.body.preferredCurrency) {
        req.user.preferredCurrency = req.body.preferredCurrency;
        options.fields.push('preferredCurrency');
    }

    if (req.body.defaultAccount) {
        req.user.defaultAccount = req.body.defaultAccount;
        options.fields.push('defaultAccount');
    }

    try {
        req.user.save(options);
    } catch (err) {
        console.error('Error updating user', err);
        return res.status(500).send({ error: 'There was an error processing your request' });
    }
    return res.status(200).send({ status: 'Success' });
};

exp.verifyEmail = async (req : Object, res : Object) => {
    const success = new SuccessResponse(res);
    const error = new ErrorResponse(res);
    const { hash, verification } = req.body || {};

    console.log('hash: ', hash);
    console.log('verification: ', verification);
    console.log('req hash: ', req.user.emailHash);
    console.log('req verification: ', req.user.emailVerification);

    if (hash !== req.user.emailHash) {
        return error.badRequest('Could not verify email');
    }

    if (verification !== req.user.emailVerification) {
        return error.badRequest('Could not verify email');
    }

    req.user.hasVerifiedEmail = true;
    await req.user.save();

    success.send(await req.user.getPublicData());
};

exp.resendVerificationEmail = async (req : Object, res : Object) => {
    await req.user.sendVerificationEmail();

    new SuccessResponse(res).send(await req.user.getPublicData());
};

// Authenticate an IP for a user
exp.verifyIp = async (req : Object, res : Object) => {
    const success = new SuccessResponse(res);
    const error = new ErrorResponse(res);

    const { randId } = req.body;

    if (!randId) {
        return error.badRequest('Id should be provided.');
    }

    let ipAuth = await AuthorizedIp.findOne({
        where: { randId, authorized: false }
    });

    if (!ipAuth) {
        return error.badRequest('IP is already verified or request not found.');
    }

    ipAuth.authorized = true;
    await ipAuth.save();

    success.send('Success.');
};

exp.addContact = async (req : Object, res : Object) => {
    let contact = {
        userId:    req.user.id,
        label:     req.body.label,
        address:   null,
        BBAccount: null,
        BBUser:    null
    };

    // contact can be created by username, username@account or address
    if (req.body.address) {
        contact.address = req.body.address;
        // check if its owned by a BB user
        let addr = await TempAddress.findOne({ where: { nanoAddress: req.body.address } });
        if (addr) {
            contact.BBAccount = addr.accountId;
            contact.BBUser = addr.userId;
        }
    } else if (req.body.username) {
        let username;
        let accName;

        if (req.body.username.indexOf('@') !== -1) {
            let aux = req.body.username.split('@');
            accName = aux[1];
            username = aux[0];
        }

        let user = await User.findOne({ where: { username } });

        if (!user) {
            return res.send(400).send({ error: 'User not found' });
        }

        if (accName) {
            let acc = await Account.findOne({ where: { userId: user.id, label: accName } });
            if (acc) {
                contact.BBAccount = acc.id;
            } else {
                return res.status(400).send({ error: 'Account specified does not exist' });
            }
        }

        contact.BBUser = user.id;

    } else {
        // missing params
        return res.status(400).send({ error: 'Missing address/username' });
    }

    Contact.create(contact).then((ctc) => {
        return res.status(200).send({ status: 'success', contact: ctc.get({ plain: true }) });
    }).catch((err) => {
        console.error(err);
        return res.status(500).send({ error: 'There was an error when trying to process your request.' });
    });
};

exp.deleteContact = (req : Object, res : Object) => {
    Contact.destroy({
        where: {
            userId: req.user.id,
            id:     req.params.contactId
        }
    }).then((count) => {
        if (count === 0) {
            return res.status(401).send({ error: 'Contact not found' });
        }
        return res.status(200).send({ status: 'success' });
    }).catch((err) => {
        console.error(err);
        return res.status(500).send({ error: 'There was an error when trying to process your request.' });
    });
};

exp.getContacts = (req : Object, res : Object) => {
    req.user.getContacts().then((contacts) => {
        let c = [];
        for (let i in contacts) {
            if (contacts[i]) {
                c.push(contacts[i].get({ plain: true }));
            }
        }
        return res.status(200).send(c);
    }).catch((err) => {
        console.error(err);
        return res.status(500).send({ error: 'There was an error when trying to process your request.' });
    });
};


exp.updateContact = (req : Object, res : Object) => {

    if (!req.params.contactId) {
        return res.status(401).send({ error: 'Missing contact id' });
    }
    // can only update nano address and label
    if (!req.body.label && !req.body.nanoAddress) {
        return res.status(401).send({ error: 'Invalid parameters' });
    }
    let values = {
        label:   req.body.label,
        address: req.body.nanoAddress
    };

    if (values.label === undefined) {
        delete values.label;
    }

    if (values.address === undefined) {
        delete values.address;
    }

    let options = {
        limit: 1,
        where: {
            userId: req.user.id,
            id:     req.params.contactId
        }
    };

    Contact.update(values, options).then((count) => {
        if (count[0] === 0) {
            return res.status(401).send({ error: 'Contact not found' });
        }
        return res.status(200).send({ status: 'Success' });
    }).catch((err) => {
        console.error(err);
        return res.status(500).send({ error: 'There was an error processing your request' });
    });
};


// Create 2FA key for user
exp.set2fa = async (req : Object, res : Object) => {
    try {
        await req.user.set2fa();
        new SuccessResponse(res).send(req.user._2FAKey);
    } catch (err) {
        new ErrorResponse(res).unauthorized(err.message);
    }
};

// Confirm and activate 2FA for user if token challenge is successful
exp.confirm2fa = async (req : Object, res : Object) => {
    try {
        await req.user.confirm2fa(req.body.token2fa);
        new SuccessResponse(res).send();
    } catch (err) {
        new ErrorResponse(res).unauthorized(err.message);
    }
};

// Deactivate 2FA (but dont remove key)
exp.deactivate2fa = async (req : Object, res : Object) => {
    try {
        await req.user.deactivate2fa(req.body.token2fa);
        new SuccessResponse(res).send();
    } catch (err) {
        new ErrorResponse(res).unauthorized(err.message);
    }
};

export default exp;
