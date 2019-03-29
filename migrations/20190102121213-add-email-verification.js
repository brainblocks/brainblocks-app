/* @flow */
/* eslint import/no-commonjs: off */

export default {
    up: async (queryInterface : Object, Sequelize : Object) => {
        await queryInterface.addColumn('Users', 'emailHash', Sequelize.STRING);
        await queryInterface.addColumn('Users', 'emailVerification', Sequelize.STRING);
        await queryInterface.addColumn('Users', 'hasVerifiedEmail', Sequelize.BOOLEAN);
        await queryInterface.addIndex('Users', { fields: [ 'emailHash' ] });

        return queryInterface;
    },

    down: async (queryInterface : Object, Sequelize : Object) => {
        await queryInterface.removeColumn('Users', 'emailHash', Sequelize.STRING);
        await queryInterface.removeColumn('Users', 'emailVerification', Sequelize.STRING);
        await queryInterface.removeColumn('Users', 'hasVerifiedEmail', Sequelize.BOOLEAN);
        await queryInterface.removeIndex('Users', [ 'emailHash' ]);

        return queryInterface;
    }
};
