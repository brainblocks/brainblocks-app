/* @flow */

import Sequelize from 'sequelize';

import conf from '../config/sequelize';

import User from './user';
import Account from './account';
import BBTransaction from './bbtransaction';
import TempAddress from './tempaddress';
import Vault from './vault';

const env = process.env.NODE_ENV || 'development';
const config = conf[env];

let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const models = {
    User:          User.init(sequelize, Sequelize),
    Account:       Account.init(sequelize, Sequelize),
    BBTransaction: BBTransaction.init(sequelize, Sequelize),
    TempAddress:   TempAddress.init(sequelize, Sequelize),
    Vault:         Vault.init(sequelize, Sequelize)
};

Object.values(models)
    // $FlowFixMe
    .filter(model => typeof model.associate === 'function')
    // $FlowFixMe
    .forEach(model => model.associate(models));
  
const db = {
    models,
    Sequelize,
    sequelize
};

export default db;
