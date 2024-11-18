'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('InventoryTransactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      product_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      transaction_type: {
        allowNull: false,
        type: Sequelize.ENUM('in', 'out')
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      quantity_type: {
        type: Sequelize.ENUM(
          'kg', 'tonne', 'quintal', 'l', 'ml', 'm', 'cm', 'pcs', 'metric_cube'
        ),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        validate :{
          len: {
           args: [4, 500],
           msg: 'Description must be between 4 to 500 characters long.'
          }
         }
      },
      description_type: {
        type: Sequelize.ENUM('text', 'audio'),
        allowNull: true,
        defaultValue: 'text',
      },
      audio_path: {
        type: Sequelize.BLOB,
        allowNull: true,
      },
      isDamaged: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    await queryInterface.dropTable('InventoryTransactions');
  }
};