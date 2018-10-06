/* @flow */

module.exports = (sequelize, DataTypes) => {
    const BBTransaction = sequelize.define('BBTransaction', {
        fromAccount:            DataTypes.INTEGER,
        toAccount:              DataTypes.INTEGER,
        amountRai:              DataTypes.BIGINT,
        amountUSD:              DataTypes.DOUBLE,
        amountSenderCurrency:   DataTypes.DOUBLE,
        senderCurrency:         DataTypes.STRING,
        amountReceiverCurrency: DataTypes.DOUBLE,
        receiverCurrency:       DataTypes.STRING
    }, {
        underscored: false,
        timestamps:   true
    });
    BBTransaction.associate = function(models) {
        BBTransaction.belongsTo(models.Account, { as: 'sender', foreignKey: 'fromAccount' });
        BBTransaction.belongsTo(models.Account, { as: 'receiver', foreignKey: 'toAccount' });
    };
    return BBTransaction;
};
