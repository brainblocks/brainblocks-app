/* @flow */

export default  {
    up: (queryInterface : Object, Sequelize : Object) => {
        return queryInterface.createTable('UserTokens', {
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
            UUID: {
                type:      Sequelize.UUID,
                allowNull: false
            },
            type: {
                type:      Sequelize.STRING,
                allowNull: false
            },
            expires: {
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
        return queryInterface.dropTable('UserTokens');
    }
};
