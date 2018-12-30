/* @flow */

export default  {
    up: (queryInterface : Object, Sequelize : Object) => {
        return queryInterface.createTable('Contacts', {
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
            label: {
                type:      Sequelize.STRING,
                allowNull: false
            },
            address: {
                type:      Sequelize.STRING,
                allowNull: true
            },
            BBAccount: {
                type:      Sequelize.INTEGER,
                allowNull: true
            },
            BBUser: {
                type:      Sequelize.INTEGER,
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
        }).then(() => queryInterface.addIndex('Contacts', {
            unique: true,
            fields: [ 'label', 'userId' ]
        }));
    },
    down: (queryInterface : Object) => {
        return queryInterface.dropTable('Contacts');
    }
};
