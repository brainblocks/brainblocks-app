/* @flow */
const sequelize = require("sequelize");

let User = sequelize.define('User', {
    username:      sequelize.STRING,
    email:         sequelize.STRING,
    passHash:      sequelize.STRING,
    firstName:     sequelize.STRING,
    lastName:      sequelize.STRING,
    birthday:      sequelize.STRING,
    is2FAEnabled:  sequelize.BOOLEAN,
    _2FATypeId:    sequelize.INTEGER,
    _2FAKey:       sequelize.INTEGER,
    _2FALastValue: sequelize.STRING
}, {
    timestamps:  true,
    underscored: false
});
User.associate = (models) => {
    User.hasMany(models.Account, { foreignKey: 'userId' });
    User.hasMany(models.TempAddress, { foreignKey: 'userId' });
    User.hasOne(models.Vault, { foreignKey: 'userId' });
};

export default User;
