/* @flow */
import Sequelize from 'sequelize';
import jwt from 'jsonwebtoken';
import uuidv4 from 'uuid/v4';
import bcrypt from 'bcrypt';

import UserToken from './usertoken';

class User extends Sequelize.Model {

    tokens = [];

    static init (sequelize : Object, DataTypes : Object) : Sequelize.Model {
        return super.init(
            {
                username:          DataTypes.STRING,
                email:             DataTypes.STRING,
                password:          DataTypes.VIRTUAL,
                passHash:          DataTypes.STRING,
                firstName:         DataTypes.STRING,
                lastName:          DataTypes.STRING,
                birthday:          DataTypes.STRING,
                preferredCurrency: DataTypes.STRING,
                is2FAEnabled:      DataTypes.BOOLEAN,
                _2FATypeId:        DataTypes.INTEGER,
                _2FAKey:           DataTypes.STRING,
                _2FALastValue:     DataTypes.STRING,
                UUID:              DataTypes.UUID
            },
            {
                sequelize,
                timestamps:  true,
                underscored: false,
                hooks:       {
                    beforeCreate:  this.beforeCreate,
                    afterDestroy: this.afterDestroy
                }
            }
        );
    }

    static associate(models : Object) {
        this.accounts = this.hasMany(models.Account, { foreignKey: 'userId' });
        this.tempAddresses = this.hasMany(models.TempAddress, { foreignKey: 'userId' });
        this.vault = this.hasOne(models.Vault, { foreignKey: 'userId' });
        this.globalTransactions = this.hasMany(models.GlobalTransaction, { foreignKey: 'userId' });
        this.tokens = this.hasMany(models.UserToken, { foreignKey: 'userId' });
        this.contacts = this.hasMany(models.Contact, { foreignKey: 'userId' });
    }

    static beforeCreate(user : self) : Promise<void> {
        return new Promise((resolve) => {
            if (!user.UUID) {
                user.UUID = uuidv4();
            }

            // hash password
            if (!user.passHash) {
                return bcrypt.hash(user.password, 10).then((hash) => {
                    user.passHash = hash;
                    resolve();
                });
            }
        });
    }

    static afterDestroy(user : self) : Promise<void> {
        return UserToken.destroy({ where: {
            userId: user.id
        } });
    }

    static findByToken(token : string) : Promise<User> {
        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_KEY);
        } catch (err) {
            return Promise.reject(err);
        }

        if (decoded.expires < Date.now()) {
            return Promise.reject(new Error('Expired token'));
        }

        return UserToken.findOne({ where: {
            id:   decoded.id,
            UUID: decoded.uuid
        } }).then((found) => {
            if (!found) {
                return Promise.reject(new Error('Expired token'));
            }

            return User.findOne({ where: {
                UUID: decoded.uuid
            } });
        });
    }

    generateAuthToken(expires : Date) : Promise<string> {
        return UserToken.create({
            userId:  this.id,
            expires,
            type:    'auth'
        });
    }

    checkPassword(password : string) : Promise<boolean> {
        return bcrypt.compare(password, this.passHash);
    }

    // example function to test auth
    getPublicData() : Object {
        let ret = {};
        ret.email = this.email;
        ret.username = this.username;
        ret.firstName = this.firstName;
        ret.lastName = this.lastName;
        ret.birthday = this.birthday;
        ret.preferredCurrency = this.preferredCurrency;
        /**
            And whatever needs to be taken
         */
        return ret;
    }
}

export default User;
