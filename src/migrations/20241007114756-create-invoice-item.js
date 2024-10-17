'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Invoice_Items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      invoice_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
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
      unit_price: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      total_price: {
        type: Sequelize.FLOAT,
        allowNull:true,
        defaultValue: 0
      },
      gst_amount: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0
      },
      sgst_amount: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0
      },
      igst_amount: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0
      },
      item_image: {
        type: Sequelize.BLOB,
        allowNull: true
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
    await queryInterface.dropTable('Invoice_Items');
  }
};