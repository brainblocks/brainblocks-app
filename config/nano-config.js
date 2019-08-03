// no lint here, es6 breaks sequelize-cli

const config = require('dotenv').config();

module.exports = {
    development: {
        host:  `http://${process.env.NODE_CONNECTION}:${process.env.NODE_RPC_PORT}`
    }
};
