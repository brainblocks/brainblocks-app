/* @flow */
import { Op } from 'sequelize';

import { checkPassword } from '../middleware/validator';
import models from '../models';

const User = models.models.User;
const UserToken = models.models.UserToken;

let exp = {};

exp.create = async (req : Object, res : Object) => {
    // check if password is strong enough
    if (!checkPassword(req.body.password)) {
        return res.status(400).send({ error: 'Password should be at least 8 characters long and contain uppercase, lowercase and digits' });
    }

    // check if username or email are taken
    const existingUser = await User.findOne({ where: {
        [Op.or]: [ { email: req.body.email }, { username: req.body.username } ]
    } })

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

export default exp;
