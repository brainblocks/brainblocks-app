/* @flow */
import { Op } from 'sequelize';

import { checkPassword } from '../middleware/validator';
import models from '../models';

const User = models.models.User;
const UserToken = models.models.UserToken;

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
        User.create({
            username: req.body.username,
            email:    req.body.email,
            password: req.body.password
        }).then((user) => {
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

export default exp;
