/* @flow */
import Sequelize from 'sequelize';
import { RaiFunctions } from 'rai-wallet';

class Contact extends Sequelize.Model {
    static init (sequelize : Object, DataTypes : Object) : Sequelize.Model {
        return super.init(
            {
                userId:         DataTypes.INTEGER,
                label:          DataTypes.STRING,
                address:        DataTypes.STRING,
                BBAccount:      DataTypes.INTEGER,
                BBUser:         DataTypes.INTEGER
            },
            {
                sequelize,
                timestamps:  true,
                underscored: false,
                hooks:       {
                    beforeSave:     this.beforeSave
                }
            }
        );
    }

    assignAccount(account : Sequelize.Account) {
        this.BBAccount = account.id;
    }

    assignUser(user : Sequelize.User) {
        this.BBUser = user.id;
    }

    static beforeSave(contact : self) : Promise<void> {
        return new Promise((resolve, reject) => {
            if (!contact.address && !contact.BBAccount && !contact.BBUser) {
                let err = new Error('One of address, BBAccount or BBUser is required.');
                reject(err);
            } else if (contact.address) {
                if (!RaiFunctions.parseXRBAccount(contact.address)) {
                    let err = new Error('Invalid Nano address');
                    reject(err);
                }
            }
            resolve();
        });
    }

    static associate(models : Object) {
        this.user = this.belongsTo(models.User, { as: 'User', foreignKey: 'userId' });
        this.Account = this.belongsTo(models.Account, { as: 'Account', foreignKey: 'BBAccount' });
        this.BBContact = this.belongsTo(models.User, { as: 'BBContact', foreignKey: 'BBUser' });
    }


}

export default Contact;
