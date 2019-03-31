/* @flow */

export default  {
    up: (queryInterface : Object, Sequelize : Object) => {
        return queryInterface.createTable('PINKeys', {
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
            sessionId: {
                type:      Sequelize.INTEGER,
                allowNull: false
            },
            PIN: {
                type:      Sequelize.INTEGER,
                allowNull: false
            },
            key: {
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
        }).then(() => queryInterface.addIndex('PINKeys', {
            unique: true,
            fields: [ 'PIN', 'sessionId' ]
        }));
    },
    down: (queryInterface : Object) => {
        return queryInterface.dropTable('PINKeys');
    }
};
