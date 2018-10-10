/* @flow */
import Sequelize from 'sequelize';

class GlobalTransaction extends Sequelize.Model {
    static init (sequelize : Object, DataTypes : Object) : Sequelize.Model {
        return super.init(
            {
                fromNanoAddress:    DataTypes.STRING,
                toNanoAddress:      DataTypes.STRING,
                type:               DataTypes.STRING,
                userId:             DataTypes.INTEGER,
                accountId:          DataTypes.INTEGER,
                amountRai:          DataTypes.BIGINT,
                amountUSD:          DataTypes.DOUBLE,
                amountUserCurrency: DataTypes.DOUBLE,
                userCurrency:       DataTypes.STRING,
                nanoTxId:           DataTypes.STRING
            },
            {
                sequelize,
                timestamps:  true,
                underscored: false
            }
        );
    }

    static associate(models : Object) {
        this.user = this.belongsTo(models.User, { foreignKey: 'userId' });
        this.account = this.belongsTo(models.Account, { foreignKey: 'accountId' });
    }

    static beforeCreate(transaction : self) {
        if (!transaction.userCurrency) {
            transaction.getUser().then((user) => {
                
                transaction.userCurrency = user.preferredCurrency;

                if (transaction.userCurrency === 'USD') {
                    transaction.amountUserCurrency = transaction.amountUSD;
                } else {
                    /* to do:  calculate amount in user currency from currency table */
                }
            });
        }
    }
}

export default GlobalTransaction;
