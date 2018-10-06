/* @flow */

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Accounts', {
            id: {
                allowNull:     false,
                autoIncrement: true,
                primaryKey:    true,
                type:          Sequelize.INTEGER
            },
            userId: {
                type:      Sequelize.INTEGER,
                allowNull: false
            },
            label: {
                type:      Sequelize.STRING,
                allowNull: false
            },
            balance: {
                type:         Sequelize.BIGINT,
                defaultValue: 0,
                allowNull:    false
            },
            balanceLastUpdated: {
                type:         Sequelize.DATE,
                defaultValue: 0,
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
        })
            .then(() => queryInterface.addIndex('Accounts', {
                unique: true,
                fields: [ 'userId', 'label' ]
            }));
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('Accounts');
    }
};
