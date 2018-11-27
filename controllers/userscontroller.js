/* @flow */
import { Op } from 'sequelize';

import { checkPassword } from '../middleware/validator';
import models from '../models';

const User = models.models.User;
const Contact = models.models.Contact;
const TempAddress = models.models.TempAddress;
const Account = models.models.Account;

let exp = {};

exp.create = async (req : Object, res : Object) => {
    // check if password is strong enough
    if (!checkPassword(req.body.password)) {
        return res.status(400).send({ error: 'Password should be at least 8 characters long and contain uppercase, lowercase and digits' });
    }

    // check if username or email are taken
    const existingUser = await User.findOne({ where: {
        [Op.or]: [ { email: req.body.email }, { username: req.body.username } ]
    } });

    if (existingUser !== null) {
        return res.status(400).send({ error: 'Username or email already taken' });
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

    res.status(200).send({
        status:  'success',
        token:   token.getJWT().toString(),
        expires: token.expires,
        user:    user.getPublicData()
    });
};

exp.getUser = (req : Object, res : Object) => {
    return res.status(200).send({ user: req.user.getPublicData(), status: 'success' });
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

export default exp;
