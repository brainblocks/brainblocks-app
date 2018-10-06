/* @flow */

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Users', {
            id: {
                allowNull:     false,
                autoIncrement: true,
                primaryKey:    true,
                type:          Sequelize.INTEGER
            },
            username: {
                type:      Sequelize.STRING,
                allowNull: false,
                unique:    true
            },
            email: {
                type:      Sequelize.STRING,
                allowNull: false,
                unique:    true
            },
            passHash: {
                type:      Sequelize.STRING,
                allowNull: false
            },
            firstName: {
                type:      Sequelize.STRING,
                allowNull: true
            },
            lastName: {
                type:      Sequelize.STRING,
                allowNull: true
            },
            birthday: {
                type:      Sequelize.DATE,
                allowNull: true
            },
            is2FAEnabled: {
                type:         Sequelize.BOOLEAN,
                allowNull:    false,
                defaultValue: false
            },
            _2FATypeId: {
                type:      Sequelize.INTEGER,
                allowNull: true
            },
            _2FAKey: {
                type:      Sequelize.STRING,
                allowNull: true
            },
            _2FALastValue: {
                type:      Sequelize.STRING,
                allowNull: true
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
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('Users');
    }
};
