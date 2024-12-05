'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Balance_Transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      transaction_type: {
        type: Sequelize.ENUM("income","expense"),
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      source: {
        type: Sequelize.ENUM("purchase","invoice", "expense"),
        allowNull: false,
      },
      previous_balance: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      new_balance: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0.00,
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Balance_Transactions');
  }
};