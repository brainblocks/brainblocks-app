/* @flow */
import Sequelize from 'sequelize';

class TempAddress extends Sequelize.Model {
    static init (sequelize, DataTypes) : Sequelize.Model {
        return super.init(
            {
                userId:              DataTypes.INTEGER,
                accountId:           DataTypes.INTEGER,
                encryptedPrivateKey: DataTypes.STRING,
                nanoAddress:         DataTypes.STRING,
                active:              DataTypes.BOOLEAN
            },
            {
                sequelize,
                timestamps:  true,
                underscored: false
            }
        );
    }

    static associate(models) {
        this.account = this.belongsTo(models.Account, { foreignKey: 'accountId' });
    }
}

export default TempAddress;
