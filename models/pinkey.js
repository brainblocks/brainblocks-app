/* @flow */
import Sequelize from 'sequelize';

class PINKey extends Sequelize.Model {
    static init (sequelize : Object, DataTypes : Object) : Sequelize.Model {
        return super.init(
            {
                userId:              DataTypes.INTEGER,
                PIN:                 DataTypes.INTEGER,
                key:                 DataTypes.STRING,
                expires:             DataTypes.DATE
            },
            {
                sequelize,
                timestamps:  true,
                underscored: false,
                tableName:   'PINKeys',
                hooks:       {
                    beforeCreate:  this.beforeCreate
                }
            }
        );
    }

    static associate(models : Object) {
        this.account = this.belongsTo(models.User, { foreignKey: 'userId' });
    }

    static beforeCreate(pinKey : self) {
        if (!pinKey.expires)
            pinKey.expires = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes by default
    }
}

export default PINKey;
