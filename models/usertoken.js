/* @flow */
import Sequelize from 'sequelize';
import jwt from 'jsonwebtoken';

import User from './user';

class UserToken extends Sequelize.Model {
    static init (sequelize : Object, DataTypes : Object) : Sequelize.Model {
        return super.init(
            {
                userId:  DataTypes.INTEGER,
                UUID:    DataTypes.UUID,
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

    static beforeCreate(token : self) : Promise<void> {
        return new Promise((resolve, reject) => {
            if (!token.expires) {
                token.expires = new Date(Date.now() + (30 * 24 * 3600 * 1000)); // 30 days ahead
            }

            if (!token.UUID) {
                User.findOne({ where: {
                    id: token.userId
                } }).then((user) => {
                    token.UUID = user.UUID;
                    resolve();
                }).catch((err) => {
                    reject(err);
                });
            } else {
                resolve();
            }
        });
    }

    static afterCreate(token : self) {
        token.getJWT();
    }

    getJWT() : jwt {
        if (!this.token) {
            this.token = jwt.sign({
                id:      this.id,
                uuid:    this.UUID,
                type:    this.type,
                expires: this.expires
            }, process.env.JWT_KEY);
        }
        return this.token;
    }
}

export default UserToken;
