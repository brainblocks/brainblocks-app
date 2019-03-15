/* @flow */
import crypto from 'crypto';

import Sequelize from 'sequelize';
import jwt from 'jsonwebtoken';
import uuidv4 from 'uuid/v4';
import bcrypt from 'bcrypt';
import authenticator from 'otplib/authenticator';
import sendGridMail from '@sendgrid/mail';

import UserToken from './usertoken';

sendGridMail.setApiKey(process.env.SENDGRID_API_KEY)
authenticator.options = { crypto };

export default class User extends Sequelize.Model {

    tokens = [];

    static init (sequelize : Object, DataTypes : Object) : Sequelize.Model {
        return super.init({
            username:          DataTypes.STRING,
            emailHash:         DataTypes.STRING,
            emailVerification: DataTypes.STRING,
            passHash:          DataTypes.STRING,
            firstName:         DataTypes.STRING,
            lastName:          DataTypes.STRING,
            birthday:          DataTypes.STRING,
            preferredCurrency: DataTypes.STRING,
            defaultAccount:    DataTypes.STRING,
            is2FAEnabled:      DataTypes.BOOLEAN,
            _2FATypeId:        DataTypes.INTEGER,
            _2FAKey:           DataTypes.STRING,
            _2FALastValue:     DataTypes.STRING,
            UUID:              DataTypes.UUID,
            hasVerifiedEmail:  {
                type:         DataTypes.BOOLEAN,
                defaultValue: false
            },
            password: {
                type: DataTypes.VIRTUAL,
                get() {
                    throw new Error("Not allowed to retrieve password, use passHash instead")
                },

                set(value) {
                    this.setDataValue('password', value);
                    this.setDataValue('passHash', bcrypt.hashSync(value, 10));
                }
            },
            email: {
                type: DataTypes.STRING,
                set(value) {
                    this.setDataValue('email', value);
                    this.setDataValue('emailHash', bcrypt.hashSync(value, 10))
                }
            },
        },{
            sequelize,
            timestamps:  true,
            underscored: false,
            hooks:       {
                beforeCreate:  this.beforeCreate,
                afterDestroy: this.afterDestroy
            }
        });
    }

    static associate(models : Object) {
        this.accounts = this.hasMany(models.Account, { foreignKey: 'userId' });
        this.tempAddresses = this.hasMany(models.TempAddress, { foreignKey: 'userId' });
        this.vault = this.hasOne(models.Vault, { foreignKey: 'userId' });
        this.globalTransactions = this.hasMany(models.GlobalTransaction, { foreignKey: 'userId' });
        this.tokens = this.hasMany(models.UserToken, { foreignKey: 'userId' });
        this.contacts = this.hasMany(models.Contact, { foreignKey: 'userId' });
    }

    static async beforeCreate(user : self) : Promise<void> {
        if (!user.UUID) {
            user.UUID = uuidv4();
        }

        // hash the password
        if (!user.passHash) {
            user.passHash = await bcrypt.hash(user.password, 10)
        }

        // hash the email
        if(!user.emailHash && user.email) {
            user.emailHash = await bcrypt.hash(user.email, 10)
        }

        // Email verification token
        user.emailVerification = crypto.randomBytes(20).toString('hex')
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

    // 2FA token challenge
    check2fa(token2fa : string) : Promise<boolean> {
        if (authenticator.check(token2fa, this._2FAKey)) {
            return Promise.resolve(true);
        } else {
            return Promise.reject(new Error('2FA is incorrect'));        
        }
    }

    // Generate 2FA secret key for user
    set2fa() : Promise<string> {
        if (this.is2FAEnabled) {
            return Promise.reject(new Error('2FA key already set'));
        } else {
            const secret = authenticator.generateSecret();
            return this.update({ _2FAKey: secret });
        }
    }

    // Activate 2FA if token challenge is succesful
    async confirm2fa(token2fa : string) : Promise<string> {
        if (this.is2FAEnabled) {
            return Promise.reject(new Error('2FA already activated'));
        } else {
            try {
                await this.check2fa(token2fa);
                return this.update({ is2FAEnabled: true });
            } catch (err) {
                return Promise.reject(new Error('2FA is incorrect'));
            }
        }
    }

    // Deactivate 2FA if token challenge is succesful
    async deactivate2fa(token2fa : string) : Promise<string> {
        if (!this.is2FAEnabled) {
            return Promise.reject(new Error('2FA already deactivated'));
        } else {
            try {
                await this.check2fa(token2fa);
                return this.update({ is2FAEnabled: false });
            } catch (err) {
                return Promise.reject(new Error('2FA is incorrect'));
            }
        }
    }

    // Example function to test auth
    getPublicData() : Object {
        let ret = {};
        ret.id = this.UUID;
        ret.email = this.email;
        ret.username = this.username;
        ret.firstName = this.firstName;
        ret.lastName = this.lastName;
        ret.birthday = this.birthday;
        ret.preferredCurrency = this.preferredCurrency;
        ret.defaultAccount = this.defaultAccount;
        ret.hasVerifiedEmail = !!this.hasVerifiedEmail;
        /**
            And whatever needs to be taken
         */
        return ret;
    }

    // Send a confirmation email to this user, post signup
    async sendVerificationEmail(): Promise<void> {
        await sendGridMail.send({
            to: this.email,
            from: process.env.SENDGRID_FROM_EMAIL,
            templateId: process.env.SENDGRID_EMAIL_VERIFICATION_TEMPLATE_ID,
            dynamic_template_data: {
                domain: process.env.WALLET_DOMAIN,
                emailHash: encodeURIComponent(this.emailHash),
                emailVerification: encodeURIComponent(this.emailVerification)
            }
        });
    }
}