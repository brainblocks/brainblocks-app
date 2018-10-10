/* @flow */
import crypto from 'crypto';

import Sequelize from 'sequelize';

class AuthorizedDevice extends Sequelize.Model {
    static init (sequelize : Object, DataTypes : Object) : Sequelize.Model {
        return super.init(
            {
                userId:      DataTypes.INTEGER,
                cookieToken: DataTypes.STRING,
                userAgent:   DataTypes.STRING,
                validUntil:  DataTypes.DATE
            },
            {
                sequelize,
                timestamps:  true,
                underscored: false
            }
        );
    }

    static beforeCreate(device : self) {
        if (!device.cookieToken) {
            device.cookieToken = crypto.randomBytes(32);
            device.cookieToken.toString('base64').replace(/\W/g, '');
        }

        if (!device.validUntil) {
            device.validUntil = new Date(Date.now() + (30 * 24 * 3600 * 1000)); // 30 days ahead
        }
    }
}

export default AuthorizedDevice;
