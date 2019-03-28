/* @flow */
/* eslint import/no-commonjs: off */

// $eslint-ignore-next-line
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Vaults', 'walletBackup', Sequelize.TEXT);
        await queryInterface.removeColumn('Vaults', 'loginKeyHash');
        await queryInterface.removeColumn('Vaults', 'loginKeySalt');
        await queryInterface.removeColumn('Vaults', 'loginKeyEnabled');
        await queryInterface.removeColumn('Vaults', 'localPoW');
        return queryInterface;
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Users', 'walletBackup');
        await queryInterface.addColumn('Vaults', 'loginKeyHash', Sequelize.STRING);
        await queryInterface.addColumn('Vaults', 'loginKeySalt', Sequelize.STRING);
        await queryInterface.addColumn('Vaults', 'loginKeyEnabled', Sequelize.BOOLEAN);
        await queryInterface.addColumn('Vaults', 'localPoW', Sequelize.BOOLEAN);
        return queryInterface;
    }
};
