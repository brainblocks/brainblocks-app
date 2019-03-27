/* @flow */
import Sequelize from 'sequelize';

class AuthorizedIp extends Sequelize.Model {
    static init (sequelize : Object, DataTypes : Object) : Sequelize.Model {
        return super.init(
            {
                userId:      DataTypes.INTEGER,
                ip:          DataTypes.STRING,
                authorized:  {
                    type:         DataTypes.BOOLEAN,
                    defaultValue: false
                },
                validUntil:  DataTypes.DATE,
                randId:      DataTypes.STRING
            },
            {
                sequelize,
                timestamps:  true,
                underscored: false,
                hooks:       {
                    beforeCreate:  this.beforeCreate
                }
            }
        );
    }

    static beforeCreate(zone : self) {
        if (!zone.validUntil) {
            zone.validUntil = new Date(Date.now() + (30 * 24 * 3600 * 1000)); // 30 days ahead
        }
    }
}

export default AuthorizedIp;
