// no lint here, es6 breaks sequelize-cli

const config = require('dotenv').config();

module.exports = {
    development: {
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        host:     process.env.DB_HOST,
        port:     process.env.DB_PORT,
        dialect:  process.env.DB_CONNECTION,
        logging:  process.env.LOGGING === 'true' ? console.log : false,
        operatorsAliases: false,
        define:   {
            underscored: false,
            timestamps: true
        }
    }
};
