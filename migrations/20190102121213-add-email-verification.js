'use strict';

export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'emailHash', Sequelize.STRING)
    await queryInterface.addColumn('Users', 'emailVerification', Sequelize.STRING)
    await queryInterface.addColumn('Users', 'hasVerifiedEmail', Sequelize.BOOLEAN)
    await queryInterface.addIndex('Users', {fields: ['emailHash']})

    return queryInterface
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('Users', ['emailHash'])
    await queryInterface.removeColumn('Users', 'emailHash')
    await queryInterface.removeColumn('Users', 'hasVerifiedEmail')
    await queryInterface.removeColumn('Users', 'emailVerification')

    return queryInterface
  }
};
