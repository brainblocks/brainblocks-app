'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Vaults', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      wallet: {
        type: Sequelize.TEXT('medium'),
        allowNull: false
      },
      identifier: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      loginKeyHash: {
        type: Sequelize.STRING(128),
        allowNull: true
      },
      loginKeySalt: {
        type: Sequelize.STRING(16),
        allowNull: true
      },
      loginKeyEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      localPoW: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Vaults');
  }
};