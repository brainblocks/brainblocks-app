/* @flow */
import Sequelize from 'sequelize';

class BBTransaction extends Sequelize.Model {
    static init (sequelize, DataTypes) : Sequelize.Model {
        return super.init(
            {
                fromAccount:            DataTypes.INTEGER,
                toAccount:              DataTypes.INTEGER,
                amountRai:              DataTypes.BIGINT,
                amountUSD:              DataTypes.DOUBLE,
                amountSenderCurrency:   DataTypes.DOUBLE,
                senderCurrency:         DataTypes.STRING,
                amountReceiverCurrency: DataTypes.DOUBLE,
                receiverCurrency:       DataTypes.STRING
            },
            {
                sequelize,
                timestamps:  true,
                underscored: false
            }
        );
    }

    static associate(models) {
        this.sender = this.belongsTo(models.Account, { foreignKey: 'fromAccount' });
        this.receiver = this.belongsTo(models.Account, { foreignKey: 'toAccount' });
    }
}

export default BBTransaction;
