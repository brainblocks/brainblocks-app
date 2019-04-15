/* @flow */
/* eslint import/no-commonjs: off */

module.exports = {
    up: async (queryInterface : Object, Sequelize : Object) => {
        await queryInterface.addColumn('Users', 'ipAuthEnabled', {
            type:         Sequelize.BOOLEAN,
            defaultValue: false
        });
        return queryInterface;
    },

    down: async (queryInterface : Object) => {
        await queryInterface.removeColumn('Users', 'ipAuthEnabled');
        return queryInterface;
    }
};
