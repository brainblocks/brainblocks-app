/* @flow */
import Sequelize from 'sequelize';

class AuthorizedGeoZone extends Sequelize.Model {
    static init (sequelize : Object, DataTypes : Object) : Sequelize.Model {
        return super.init(
            {
                userId:      DataTypes.INTEGER,
                zone:        DataTypes.STRING,
                validUntil:  DataTypes.DATE
            },
            {
                sequelize,
                timestamps:  true,
                underscored: false
            }
        );
    }

    static beforeCreate(zone : self) {
        if (!zone.validUntil) {
            zone.validUntil = new Date(Date.now() + (30 * 24 * 3600 * 1000)); // 30 days ahead
        }
    }
}

export default AuthorizedGeoZone;
