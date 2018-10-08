/* @flow */
import Sequelize from 'sequelize';

class Vault extends Sequelize.Model {
    static init (sequelize, DataTypes) : Sequelize.Model {
        return super.init(
            {
                userId:          DataTypes.INTEGER,
                wallet:          DataTypes.TEXT,
                identifier:      DataTypes.STRING,
                loginKeyHash:    DataTypes.STRING,
                loginKeySalt:    DataTypes.STRING,
                loginKeyEnabled: DataTypes.BOOLEAN,
                localPoW:        DataTypes.BOOLEAN
            },
            {
                sequelize,
                timestamps:  true,
                underscored: false
            }
        );
    }

    static associate(models) {
        this.account = this.belongsTo(models.User, { foreignKey: 'userId' });
    }
}

export default Vault;
