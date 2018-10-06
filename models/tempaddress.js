/* @flow */

module.exports = (sequelize, DataTypes) => {
    const TempAddress = sequelize.define('TempAddress', {
        userId:              DataTypes.INTEGER,
        accountId:           DataTypes.INTEGER,
        encryptedPrivateKey: DataTypes.STRING,
        nanoAddress:         DataTypes.STRING,
        active:              DataTypes.BOOLEAN
    }, {
        timestamps:  true,
        underscored: false
    });
    TempAddress.associate = function(models) {
        TempAddress.belongsTo(models.Account, { foreignKey: 'accountId' });
    };
    return TempAddress;
};
