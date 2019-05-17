/* @flow */
import { Op } from 'sequelize';

import models from '../models';

const User = models.models.User;

export default {
    up: () => {
        return Promise.all([
            User.create({
                username: 'mochatest_login',
                email:    'mochatest@mochatest.fave',
                password: 'e3c3a40a2c29fec3fc0c9f150430cd1fbd7f0e218175ce5d93aa3a054a339660' // password = HashedPassword123!
            }),
            User.create({
                username: 'mochatest_sout',
                email:    'mochatest2@mochatest.fave',
                password: 'e3c3a40a2c29fec3fc0c9f150430cd1fbd7f0e218175ce5d93aa3a054a339660' // password = HashedPassword123!
            })
        ]).then((users) => {
            return Promise.all([
                users[0].generateAuthToken(new Date(32503680000000)), // year 3000, so it doesnt expire
                users[1].generateAuthToken(new Date(32503680000000))
            ]);
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

