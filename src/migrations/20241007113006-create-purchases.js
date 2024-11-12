'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Purchases', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id'
        }
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      quantity_type: {
        type: Sequelize.ENUM(
          'kg', 'tonne', 'quintal', 'l', 'ml', 'm', 'cm', 'pcs', 'metric_cube'
        ),
        allowNull: false
      },
      total_cost: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      payment_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      payment_status: {
        type: Sequelize.ENUM("paid", "unpaid", "partial-payment"),
        allowNull: false
      },
      payment_due_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      vendor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // references: {
        //   model: 'Vendors',
        //   key: 'id'
        // }
      },
      invoice_Bill: {
        type: Sequelize.BLOB,
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Purchases');
  }
};