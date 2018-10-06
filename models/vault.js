'use strict';
module.exports = (sequelize, DataTypes) => {
  const Vault = sequelize.define('Vault', {
    userId: DataTypes.INTEGER,
    wallet: DataTypes.TEXT,
    identifier: DataTypes.STRING,
    loginKeyHash: DataTypes.STRING,
    loginKeySalt: DataTypes.STRING,
    loginKeyEnabled: DataTypes.BOOLEAN,
    localPoW: DataTypes.BOOLEAN,
  }, {
    underscored: false,
    timestamps: true
  });
  Vault.associate = function(models) {
    Vault.belongsTo(models.User, {foreignKey: 'userId'});
  };
  return Vault;
};
