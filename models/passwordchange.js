/* @flow */
import crypto from 'crypto';

import Sequelize from 'sequelize';


class PasswordChange extends Sequelize.Model {
    static init (sequelize : Object, DataTypes : Object) : Sequelize.Model {
        return super.init(
            {
                userId:          DataTypes.INTEGER,
                oldPasswordHash: DataTypes.STRING,
                ip:              DataTypes.STRING
            },
            {
                sequelize,
                timestamps:  true,
                updatedAt:   false,
                underscored: false
            }
        );
    }
}

export default PasswordChange;
