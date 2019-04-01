/* @flow */

export default {
    up: (queryInterface : Object, Sequelize : Object) => {
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
    down: (queryInterface : Object) => {
        return queryInterface.dropTable('Accounts');
    }
};
