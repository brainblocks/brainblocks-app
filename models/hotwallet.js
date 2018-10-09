/* @flow */
import Sequelize from 'sequelize';

class HotWallet extends Sequelize.Model {
    static init (sequelize : Object, DataTypes : Object) : Sequelize.Model {
        return super.init(
            {
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

    static associate(models : Object) {
        this.sentTransfers = this.hasMany(models.HotColdWalletTransfer, { as: 'SentTransfers', foreignKey: 'fromId' });
        this.receivedTransfers = this.hasMany(models.HotColdWalletTransfer, { as: 'ReceivedTransfers', foreignKey: 'toId' });
    }

    getTransfers() : Promise<mixed> {
        return Promise.all([
            this.getSentTransfers(),
            this.getReceivedTransfers()
        ]).then((sentAndRec) => {
            let transfers = [];
            if (sentAndRec.length > 0) {
                transfers = sentAndRec[0];
                transfers.push(...sentAndRec[1]);
                transfers.sort((a, b) => {
                    let dateA = new Date(a.createdAt);
                    let dateB = new Date(b.createdAt);
                    return dateA - dateB;
                });
            }
            return transfers;
        }).catch((err) => {
            console.error(err);
            return false;
        });
    }
}

export default HotWallet;
