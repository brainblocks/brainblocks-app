/* @flow */

export default {
    up: (queryInterface : Object, Sequelize : Object) => {
        return queryInterface.addColumn('Users', 'UUID', {
            type:         Sequelize.UUID,
            allowNull:    true,
            unique:       true,
            defaultValue: null
        }).then(() => {
            return queryInterface.addIndex('Users', [ 'UUID' ], {
                indicesType: 'UNIQUE'
            });
        });
    },

    down: (queryInterface : Object) => {
        return queryInterface.removeIndex('Users', [ 'UUID' ]).then(() => {
            return queryInterface.removeColumn('Users', 'UUID');
        });
    }
};
