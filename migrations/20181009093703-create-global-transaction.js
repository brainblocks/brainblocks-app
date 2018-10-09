/* @flow */

export default {
    up: (queryInterface : Object, Sequelize : Object) => {
        return queryInterface.createTable('GlobalTransactions', {
            id: {
                allowNull:     false,
                autoIncrement: true,
                primaryKey:    true,
                type:          Sequelize.INTEGER
            },
            fromNanoAddress: {
                type:      Sequelize.STRING,
                allowNull: false
            },
            toNanoAddress: {
                type:      Sequelize.STRING,
                allowNull: false
            },
            type: {
                type:      Sequelize.STRING,
                allowNull: false
            },
            userId: {
                type:      Sequelize.INTEGER,
                allowNull: false
            },
            accountId: {
                type:      Sequelize.INTEGER,
                allowNull: false
            },
            amountRai: {
                type:      Sequelize.BIGINT,
                allowNull: false
            },
            amountUSD: {
                type:      Sequelize.DOUBLE,
                allowNull: false
            },
            amountUserCurrency: {
                type:      Sequelize.DOUBLE,
                allowNull: false
            },
            userCurrency: {
                type:      Sequelize.STRING,
                allowNull: false
            },
            nanoTxId: {
                type:      Sequelize.STRING,
                allowNull: false
            },
            createdAt: {
                allowNull: false,
                type:      Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type:      Sequelize.DATE
            }
        }).then(() => {
            queryInterface.addConstraint('GlobalTransactions', [ 'type' ], {
                type:  'check',
                where: {
                    type: [ 'in', 'out' ]
                }
            });
        });
    },
    down: (queryInterface) => {
        return queryInterface.dropTable('GlobalTransactions');
    }
};
