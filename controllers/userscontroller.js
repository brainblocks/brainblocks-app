/* @flow */
import { Op } from 'sequelize';

import { checkPassword } from '../middleware/validator';
import models from '../models';

const User = models.models.User;
const UserToken = models.models.UserToken;
const Contact = models.models.Contact;
const TempAddress = models.models.TempAddress;
const Account = models.models.Account;

let exp = {};

exp.create = (req : Object, res : Object) => {
    // check if password is strong enough
    if (!checkPassword(req.body.password)) {
        return res.status(400).send({ error: 'Password should be at least 6 characters long and contain uppercase, lowercase and digits' });
    }
    // check if username or email are taken
    User.findOne({ where: {
        [Op.or]: [ { email: req.body.email }, { username: req.body.username } ]
    } }).then((usr) => {
        if (usr !== null) {
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

        User.create(create).then((user) => {
            user.generateAuthToken().then((token) => {
                return res.send({
                    status:       'success',
                    sessionToken: token.toString(),
                    username:     user.username,
                    email:        user.email
                });
            }).catch(() => {
                return res.status(500).send({ error: 'There was an error processing your request' });
            });
        });

    }).catch(() => {
        return res.status(500).send({ error: 'There was an error processing your request' });
    });
};

exp.login = (req : Object, res : Object) => {

    let searchBy = {};
    if (req.body.username) {
        searchBy = { username: req.body.username };
    } else if (req.body.email) {
        searchBy = { email: req.body.email };
    } else {
        return res.status(400).send({ error: 'Malformed request.' });
    }

    User.findOne({ where: searchBy })
        .then((user) => {
            if (user) {
                // check password
                user.checkPassword(req.body.password).then((check) => {
                    if (!check) {
                        return res.status(400).send({ error: 'Invalid credentials' });
                    }

                    return UserToken.findOne({
                        where: {
                            userId:  user.id,
                            expires: {
                                [Op.gt]: new Date(Date.now())
                            }
                        }
                    }).then(async (token) => {
                        if (!token) {
                            token = await user.generateAuthToken();
                        }

                        res.status(200).send({
                            status:   'success',
                            username: user.username,
                            email:    user.email,
                            session:  token.getJWT().toString(),
                            expires:  token.expires
                        });
                    });

                });
            } else {
                // user not found
                return res.status(400).send({ error: 'Invalid credentials' });
            }
        });
    
};

exp.signOut = (req : Object, res : Object) => {
    // delete auth token
    UserToken.fromRawToken(req.token)
        .then((token) => {
            if (token) {
                token.destroy();
                return res.status(200).send({ status: 'success' });
            }

            return res.status(400).send({ error: 'Token not found' });
        }).catch((err) => {
            console.error(err);
            return res.status(500).send({ error: 'There was an error when trying to process your request' });
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

    Contact.create(contact).then(() => {
        return res.status(200).send({ status: 'success' });
    }).catch((err) => {
        console.error(err);
        return res.status(500).send({ error: 'There was an error when trying to process your request.' });
    });
};

exp.deleteContact = (req : Object, res : Object) => {
    Contact.destroy({
        where: {
            userId: req.user.id,
            label:  req.body.label
        }
    }).then(() => {
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

export default exp;
