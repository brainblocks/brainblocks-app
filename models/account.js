'use strict';
module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define('Account', {
    userId: DataTypes.INTEGER,
    label: DataTypes.STRING,
    balance: DataTypes.BIGINT,
    balanceLastUpdated: DataTypes.DATE
  }, {
    timestamps: true,
    underscored: false
  });
  Account.associate = function(models) {
    Account.belongsTo(models.User);
  };
  return Account;
};