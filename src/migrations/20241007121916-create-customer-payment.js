'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Customer_Payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      customer_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'Customers',
          key: 'id'
        }
      },
      invoice_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Invoices',
          key: 'id'
        }
      },
      payment_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      amount: {
        allowNull: false,
        type: Sequelize.DECIMAL(20,2),
        defaultValue: 0.00
      },
      payment_method: {
        allowNull: false,
        type: Sequelize.ENUM("cash", "digital-payment")
      },
      payment_status: {
        allowNull: false,
        type: Sequelize.ENUM("paid","unpaid","partial-paid")
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
    await queryInterface.dropTable('Customer_Payments');
  }
};