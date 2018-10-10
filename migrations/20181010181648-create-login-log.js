/* @flow */

export default {
    up: (queryInterface : Object, Sequelize : Object) => {
        return queryInterface.createTable('LoginLogs', {
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
            success: {
                type:         Sequelize.BOOLEAN,
                defaultValue: false
            },
            failReason: {
                type:      Sequelize.STRING,
                allowNull: true
            },
            attemptCount: {
                type:         Sequelize.INTEGER,
                allowNull:    false,
                defaultValue: 0
            },
            ip: {
                type:      Sequelize.STRING,
                allowNull: false
            },
            requestData: {
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
        });
    },
    down: (queryInterface : Object) => {
        return queryInterface.dropTable('LoginLogs');
    }
};
