/* @flow */

export default {
    up: (queryInterface : Object, sequelize : Object) => {
        return queryInterface.createTable('Accounts', {
            id: {
                allowNull:     false,
                autoIncrement: true,
                primaryKey:    true,
                type:          sequelize.INTEGER
            },
            userId: {
                type:      sequelize.INTEGER,
                allowNull: false
            },
            label: {
                type:      sequelize.STRING,
                allowNull: false
            },
            balance: {
                type:         sequelize.BIGINT,
                defaultValue: 0,
                allowNull:    false
            },
            balanceLastUpdated: {
                type:         sequelize.DATE,
                defaultValue: 0,
                allowNull:    false
            },
            createdAt: {
                allowNull: false,
                type:      sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type:      sequelize.DATE
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
