'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    passHash: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    birthday: DataTypes.STRING,
    is2FAEnabled: DataTypes.BOOLEAN,
    _2FATypeId: DataTypes.INTEGER,
    _2FAKey: DataTypes.INTEGER,
    _2FALastValue: DataTypes.STRING,
  }, {
    timestamps: true,
    underscored: false
  });
  User.associate = function(models) {
    User.hasMany(models.Account, {foreignKey: 'userId'});
    User.hasMany(models.TempAddress, {foreignKey: 'userId'});
    User.hasOne(models.Vault, {foreignKey: 'userId'});
  };
  return User;
};