/* @flow */

export default  {
    up: (queryInterface : Object, Sequelize : Object) => {
        return queryInterface.createTable('HotWallets', {
            id: {
                allowNull:     false,
                autoIncrement: true,
                primaryKey:    true,
                type:          Sequelize.INTEGER
            },
            encryptedPrivateKey: {
                type:      Sequelize.STRING,
                allowNull: false
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
        return queryInterface.dropTable('HotWallets');
    }
};
