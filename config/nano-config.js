// no lint here, es6 breaks sequelize-cli

const config = require('dotenv').config();

module.exports = {
    development: {
        host:  process.env.NODE_CONNECTION
    }
};
