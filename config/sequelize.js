/* @flow */

import config from 'dotenv';

config.config();

export default {
    development: {
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        host:     process.env.DB_HOST,
        port:     process.env.DB_PORT,
        dialect:  process.env.DB_CONNECTION,
        define:   {
            underscored: true
        }
    }
};
