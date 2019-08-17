/* @flow */
import Sequelize from 'sequelize';

import HotWallet from './hotwallet';
import ColdWallet from './coldwallet';

class HotColdWalletTransfer extends Sequelize.Model {
    static init (sequelize : Object, DataTypes : Object) : Sequelize.Model {
        return super.init(
            {
                nanoTxId:     DataTypes.STRING,
                type:         DataTypes.STRING,
                fromId:       DataTypes.INTEGER,
                fromAddress:  DataTypes.STRING,
                toId:         DataTypes.INTEGER,
                toAddress:    DataTypes.STRING,
                amountRai:    DataTypes.BIGINT,
                authorizedBy: DataTypes.STRING
            },
            {
                sequelize,
                timestamps:  true,
                underscored: false
            }
        );
    }

    getSender() : Sequelize.model {
        if ([ 'hot_to_hot', 'hot_to_cold' ].includes(this.type)) {
            return HotWallet.findOne({
                where: {
                    id: this.fromId
                }
            });
        } else if ([ 'cold_to_hot', 'cold_to_cold' ].includes(this.type)) {
            return ColdWallet.findOne({
                where: {
                    id: this.fromId
                }
            });
        }

        throw new Error(`Invalid HotColdWalletTransfer type: ${ this.type }`);
    }

    getReceiver() : Sequelize.Model {
        if ([ 'hot_to_hot', 'cold_to_hot' ].includes(this.type)) {
            return HotWallet.findOne({
                where: {
                    id: this.toId
                }
            });
        } else if ([ 'hot_to_cold', 'cold_to_cold' ].includes(this.type)) {
            return ColdWallet.findOne({
                where: {
                    id: this.toId
                }
            });
        }

        throw new Error(`Invalid HotColdWalletTransfer type: ${ this.type }`);
    }


    static associate(models : Object) {
        this.sender = this.hasOne(models.HotColdWalletTransfer, { as: 'SentTransfers', foreignKey: 'fromId' });
        this.receiver = this.hasOne(models.HotColdWalletTransfer, { as: 'ReceivedTransfers', foreignKey: 'toId' });
    }
}

export default HotColdWalletTransfer;
