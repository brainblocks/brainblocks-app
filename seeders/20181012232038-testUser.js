/* @flow */
import { Op } from 'sequelize';

import models from '../models';

const User = models.models.User;

export default {
    up: () => {
        return User.create({
            username: 'mochatest_login',
            email:    'mochatest@mochatest.fave',
            password: 'mochatestpassword'
        }).then((user) => {
            return user.generateAuthToken(new Date(32503680000000)); // year 3000, so it doesnt expire
        });
    },

    down: () => {
        return User.destroy({
            where: {
                username: {
                    [Op.like]: 'mochatest_%'
                }
            },
            individualHooks: true
        });
    }
};

