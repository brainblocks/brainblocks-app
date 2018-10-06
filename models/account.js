/* @flow */

module.exports = (sequelize, DataTypes) => {
    const Account = sequelize.define('Account', {
        userId:             DataTypes.INTEGER,
        label:              DataTypes.STRING,
        balance:            DataTypes.BIGINT,
        balanceLastUpdated: DataTypes.DATE
    }, {
        timestamps:  true,
        underscored: false
    });
    Account.associate = function(models) {
        Account.belongsTo(models.User, { foreignKey: 'userId' });
        Account.hasMany(models.TempAddress, { foreignKey: 'accountId' });
        Account.hasMany(models.BBTransaction, { as: 'Receives', foreignKey: 'toAccount' });
        Account.hasMany(models.BBTransaction, { as: 'Sends', foreignKey: 'fromAccount' });
    };
    return Account;
};
