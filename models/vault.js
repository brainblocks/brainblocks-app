/* @flow */
import Sequelize from 'sequelize';
import uuidv4 from 'uuid/v4';

class Vault extends Sequelize.Model {
    static init (sequelize : Object, DataTypes : Object) : Sequelize.Model {
        return super.init(
            {
                userId:       DataTypes.INTEGER,
                wallet:       DataTypes.TEXT,
                walletBackup: DataTypes.TEXT,
                identifier:   DataTypes.STRING
            },
            {
                sequelize,
                timestamps:  true,
                underscored: false,
                hooks:       {
                    beforeCreate:  this.beforeCreate
                }
            }
        );
    }

    static associate(models : Object) {
        this.account = this.belongsTo(models.User, { foreignKey: 'userId' });
    }

    static beforeCreate(vault : self) {
        if (!vault.identifier) {
            vault.identifier = uuidv4();
        }
    }

    toJSON() : Object {
        return {
            wallet:     this.wallet,
            identifier: this.identifier,
            updated_at: this.updated_at
        };
    }
}

export default Vault;
