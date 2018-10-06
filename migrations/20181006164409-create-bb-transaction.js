/* @flow */

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('BBTransactions', {
            id: {
                allowNull:     false,
                autoIncrement: true,
                primaryKey:    true,
                type:          Sequelize.INTEGER
            },
            fromAccount: {
                type:      Sequelize.INTEGER.UNSIGNED,
                allowNull: false
            },
            toAccount: {
                type:      Sequelize.INTEGER.UNSIGNED,
                allowNull: false
            },
            amountRai: {
                type:      Sequelize.BIGINT.UNSIGNED,
                allowNull: false
            },
            amountUSD: {
                type:      Sequelize.DOUBLE.UNSIGNED,
                allowNull: false
            },
            amountSenderCurrency: {
                type:      Sequelize.DOUBLE.UNSIGNED,
                allowNull: true
            },
            senderCurrency: {
                type:      Sequelize.STRING,
                allowNull: true
            },
            amountReceiverCurrency: {
                type:      Sequelize.DOUBLE.UNSIGNED,
                allowNull: true
            },
            receiverCurrency: {
                type:      Sequelize.STRING,
                allowNull: true
            },
            createdAt: {
                allowNull: false,
                type:      Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type:      Sequelize.DATE
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('BBTransactions');
    }
};
