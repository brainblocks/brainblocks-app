/* @flow */

import Sequelize from 'sequelize';

import conf from '../config/sequelize';

import User from './user';
import Account from './account';
import BBTransaction from './bbtransaction';
import GlobalTransaction from './globaltransaction';
import TempAddress from './tempaddress';
import Vault from './vault';
import ColdWallet from './coldwallet';
import HotWallet from './hotwallet';
import HotColdWalletTransfer from './hotcoldwallettransfer';
import NanoPrice from './nanoprice';
import AuthorizedDevice from './authorizeddevice';
import AuthorizedGeoZone from './authorizedgeozone';
import AuthorizedIp from './authorizedip';
import LoginLog from './loginlog';
import PasswordReset from './passwordreset';
import UserToken from './usertoken';
import Contact from './contact';

const env = process.env.NODE_ENV || 'development';
const config = conf[env];

let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const models = {
    User:                  User.init(sequelize, Sequelize),
    Account:               Account.init(sequelize, Sequelize),
    BBTransaction:         BBTransaction.init(sequelize, Sequelize),
    GlobalTransaction:     GlobalTransaction.init(sequelize, Sequelize),
    TempAddress:           TempAddress.init(sequelize, Sequelize),
    Vault:                 Vault.init(sequelize, Sequelize),
    ColdWallet:            ColdWallet.init(sequelize, Sequelize),
    HotWallet:             HotWallet.init(sequelize, Sequelize),
    HotColdWalletTransfer: HotColdWalletTransfer.init(sequelize, Sequelize),
    NanoPrice:             NanoPrice.init(sequelize, Sequelize),
    AuthorizedDevice:      AuthorizedDevice.init(sequelize, Sequelize),
    AuthorizedGeoZone:     AuthorizedGeoZone.init(sequelize, Sequelize),
    AuthorizedIp:          AuthorizedIp.init(sequelize, Sequelize),
    LoginLog:              LoginLog.init(sequelize, Sequelize),
    PasswordReset:         PasswordReset.init(sequelize, Sequelize),
    UserToken:             UserToken.init(sequelize, Sequelize),
    Contact:               Contact.init(sequelize, Sequelize)
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
