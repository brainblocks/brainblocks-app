'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'defaultAccount', Sequelize.STRING)
    return queryInterface
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'defaultAccount');
    return queryInterface
  }
};
