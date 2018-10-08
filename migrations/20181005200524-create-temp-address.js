/* @flow */

export default {
    up: (queryInterface : Object, Sequelize : Object) => {
        return queryInterface.createTable('TempAddresses', {
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
            accountId: {
                type:      Sequelize.INTEGER,
                allowNull: false
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
                defaultValue: true
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
        return queryInterface.dropTable('TempAddresses');
    }
};
