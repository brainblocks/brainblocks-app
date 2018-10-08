/* @flow */
import Sequelize from 'sequelize';

class User extends Sequelize.Model {
    static init (sequelize, DataTypes) : Sequelize.Model {
        return super.init(
            {
                username:      DataTypes.STRING,
                email:         DataTypes.STRING,
                passHash:      DataTypes.STRING,
                firstName:     DataTypes.STRING,
                lastName:      DataTypes.STRING,
                birthday:      DataTypes.STRING,
                is2FAEnabled:  DataTypes.BOOLEAN,
                _2FATypeId:    DataTypes.INTEGER,
                _2FAKey:       DataTypes.STRING,
                _2FALastValue: DataTypes.STRING
            },
            {
                sequelize,
                timestamps:  true,
                underscored: false
            }
        );
    }

    static associate(models) {
        this.accounts = this.hasMany(models.Account, { foreignKey: 'userId' });
        this.tempAddresses = this.hasMany(models.TempAddress, { foreignKey: 'userId' });
        this.vault = this.hasOne(models.Vault, { foreignKey: 'userId' });
    }
}

export default User;
