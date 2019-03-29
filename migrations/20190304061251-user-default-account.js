/* @flow */
/* eslint import/no-commonjs: off */

module.exports = {
    up: async (queryInterface : Object, Sequelize : Object) => {
        await queryInterface.addColumn('Users', 'defaultAccount', Sequelize.STRING);
        return queryInterface;
    },

    down: async (queryInterface : Object, Sequelize : Object) => {
        await queryInterface.removeColumn('Users', 'defaultAccount', Sequelize.STRING);
        return queryInterface;
    }
};
