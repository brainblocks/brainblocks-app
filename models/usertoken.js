/* @flow */
import Sequelize from 'sequelize';
import jwt from 'jsonwebtoken';

import User from './user';

class UserToken extends Sequelize.Model {
    static init (sequelize : Object, DataTypes : Object) : Sequelize.Model {
        return super.init(
            {
                userId:  DataTypes.INTEGER,
                type:    DataTypes.STRING,
                expires: DataTypes.DATE
            },
            {
                sequelize,
                timestamps:  true,
                underscored: false,
                hooks:       {
                    beforeCreate: this.beforeCreate,
                    afterCreate:  this.afterCreate
                }
            }
        );
    }

    static associate(models : Object) {
        this.user = this.belongsTo(models.User, { as: 'User', foreignKey: 'userId' });
    }

    static beforeCreate(token : self) {
        if (!token.expires) {
            token.expires = new Date(Date.now() + (30 * 24 * 3600 * 1000)); // 30 days ahead
        }
    }

    static afterCreate(token : self) {
        User.findOne({ where: {
            id: token.userId
        } }).then((user) => {
            token.token = jwt.sign({
                id:      token.id,
                uuid:    user.UUID,
                type:    token.type,
                expires: token.expires
            }, process.env.JWT_KEY).toString();
        }).catch((err) => {
            throw new Error(err);
        });
    }
}

export default UserToken;
