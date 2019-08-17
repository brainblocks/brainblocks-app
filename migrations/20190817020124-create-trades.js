/* @flow */

export default {
    up: (queryInterface : Object, Sequelize : Object) => {
        return queryInterface.createTable('Trades', {
            id: {
                allowNull:     false,
                autoIncrement: true,
                primaryKey:    true,
                type:          Sequelize.INTEGER
            },
            userId: {
                type: Sequelize.INTEGER
            },
            tradeId: {
                type: Sequelize.STRING
            },
            from: {
                type: Sequelize.STRING
            },
            to: {
                type: Sequelize.STRING
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
    down: (queryInterface : Object) => {
        return queryInterface.dropTable('Trades');
    }
};
