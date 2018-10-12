/* @flow */

import validator from 'email-validator';
import passwordValidator from 'password-validator';
import { Op } from 'sequelize';

import models from '../models';

const User = models.models.User;

let exp = {};

exp.create = (req : Object, res : Object) => {
    // check if email is correct
    if (!validator.validate(req.body.email)) {
        return res.status(400).send({ error: 'Invalid email address' });
    }

    // check password strength
    let schema = new passwordValidator();
    schema.is().min(8)
        .has().uppercase()
        .has().lowercase()
        .has().digits();

    if (!schema.validate(req.body.password)) {
        return res.status(400).send({ error: 'Password should contain numbers, lowercase and uppercase letters.' });
    }

    // check username
    if (!(/^[a-z0-9]{6,16}$/i).test(req.body.username)) {
        return res.status(400).send({ error: 'Invalid username' });
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
                    sessionToken: token,
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

export default exp;
