/* @flow */

export default {
    up: (queryInterface : Object, Sequelize : Object) => {
        return queryInterface.createTable('PasswordResets', {
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
            oldPasswordHash: {
                type:      Sequelize.STRING,
                allowNull: false
            },
            ip: {
                type:      Sequelize.STRING,
                allowNull: false
            },
            token: {
                type:      Sequelize.STRING,
                allowNull: false
            },
            expires: {
                type:      Sequelize.DATE,
                allowNull: false
            },
            reset: {
                type:         Sequelize.BOOLEAN,
                allowNull:    false,
                defaultValue: false
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
        return queryInterface.dropTable('PasswordResets');
    }
};

