/* @flow */

export default  {
    up: (queryInterface : Object, Sequelize : Object) => {
        return queryInterface.createTable('ColdWallets', {
            id: {
                allowNull:     false,
                autoIncrement: true,
                primaryKey:    true,
                type:          Sequelize.INTEGER
            },
            nanoAddress: {
                type:      Sequelize.STRING,
                allowNull: false,
                unique:    true
            },
            active: {
                type:         Sequelize.BOOLEAN,
                defaultValue: true,
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
        });
    },
    down: (queryInterface : Object) => {
        return queryInterface.dropTable('ColdWallets');
    }
};
