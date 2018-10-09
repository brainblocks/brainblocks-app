/* @flow */

export default  {
    up: (queryInterface : Object, Sequelize : Object) => {
        return queryInterface.createTable('HotColdWalletTransfers', {
            id: {
                allowNull:     false,
                autoIncrement: true,
                primaryKey:    true,
                type:          Sequelize.INTEGER
            },
            nanoTxId: {
                type:      Sequelize.STRING,
                allowNull: false,
                unique:    true
            },
            type: {
                type:      Sequelize.STRING,
                allowNull: false
            },
            fromId: {
                type:      Sequelize.INTEGER,
                allowNull: false
            },
            fromAddress: {
                type:      Sequelize.STRING,
                allowNull: false
            },
            toId: {
                type:      Sequelize.INTEGER,
                allowNull: false
            },
            toAddress: {
                type:      Sequelize.STRING,
                allowNull: false
            },
            amountRai: {
                type:      Sequelize.BIGINT,
                allowNull: false
            },
            authorizedBy: {
                type:         Sequelize.STRING,
                defaultValue: 'app',
                allowNull:    false
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
            queryInterface.addConstraint('HotColdWalletTransfers', [ 'type' ], {
                type:  'check',
                where: {
                    type: [ 'hot_to_cold', 'cold_to_hot', 'hot_to_hot', 'cold_to_cold' ]
                }
            });
        });
    },
    down: (queryInterface : Object) => {
        return queryInterface.dropTable('HotColdWalletTransfers');
    }
};
