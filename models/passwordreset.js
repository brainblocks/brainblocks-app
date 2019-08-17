/* @flow */
import crypto from 'crypto';

import Sequelize from 'sequelize';

class PasswordReset extends Sequelize.Model {
    static init (sequelize : Object, DataTypes : Object) : Sequelize.Model {
        return super.init(
            {
                userId:          DataTypes.INTEGER,
                oldPasswordHash: DataTypes.STRING,
                ip:              DataTypes.STRING,
                token:           DataTypes.STRING,
                expires:         DataTypes.DATE,
                reset:           DataTypes.BOOLEAN
            },
            {
                sequelize,
                timestamps:  true,
                underscored: false
            }
        );
    }

    static beforeCreate(pr : self) {
        if (!pr.token) {
            let token = crypto.randomBytes(32);
            token.toString('base64').replace(/\W/g, '');
            pr.token = token;
        }

        if (!pr.expires) {
            pr.expires = new Date(Date.now() + (5 * 3600 * 1000)); // 5 hours ahead
        }
    }
}

export default PasswordReset;
