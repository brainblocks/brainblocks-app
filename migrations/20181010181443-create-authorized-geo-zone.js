/* @flow */

export default {
    up: (queryInterface : Object, Sequelize : Object) => {
        return queryInterface.createTable('AuthorizedGeoZones', {
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
            zone: {
                type:      Sequelize.STRING,
                allowNull: false
            },
            validUntil: {
                type:      Sequelize.DATE,
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
        return queryInterface.dropTable('AuthorizedGeoZones');
    }
};
