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
      // product_id: {
      //   type: Sequelize.INTEGER,
      //   allowNull: false,
      //   references: {
      //     model: 'Products',
      //     key: 'id'
      //   }
      // },
      // quantity: {
      //   type: Sequelize.INTEGER,
      //   allowNull: false
      // },
      // quantity_type: {
      //   type: Sequelize.ENUM(
      //   'kg', 'tonne', 'quintal', 'l', 'ml', 'm', 'cm', 'pcs', 'metric_cube', 
      //   'bags', 'feet', 'sheets', 'bundles', 'yard', 'mm', 'sqft', 'cubic_feet'
      //   ),
      //   allowNull: false
      // },
      total_cost: {
        type: Sequelize.DECIMAL(20,2),
        allowNull: false,
        defaultValue: 0.00
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
        type: Sequelize.TEXT('long'),
        allowNull: true // done today
      },
      due_amount: {
        type: Sequelize.DECIMAL(20,2),
        allowNull: true,
        defaultValue: 0.00
      },
      item_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      items: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
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