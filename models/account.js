/* @flow */
import Sequelize from 'sequelize';

class Account extends Sequelize.Model {
    static init (sequelize, DataTypes) : Sequelize.Model {
        return super.init(
            {
                userId:             DataTypes.INTEGER,
                label:              DataTypes.STRING,
                balance:            DataTypes.BIGINT,
                balanceLastUpdated: DataTypes.DATE
            },
            {
                sequelize,
                timestamps:  true,
                underscored: false
            }
        );
    }

    static associate(models) {
        this.user = this.belongsTo(models.User, { foreignKey: 'userId' });
        this.tempAddresses = this.hasMany(models.TempAddress, { foreignKey: 'accountId' });
        this.receives = this.hasMany(models.BBTransaction, { as: 'Receives', foreignKey: 'toAccount' });
        this.sends = this.hasMany(models.BBTransaction, { as: 'Sends', foreignKey: 'fromAccount' });
    }
}

export default Account;
