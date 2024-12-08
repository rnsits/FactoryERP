'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate:{
          len: {
            args: [3,30],
            msg: 'Name must be between 3 and 30 characters long.'
          }
        }
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
        allowNull: false,
        defaultValue: 'text'
      },
      audio_path: {
        type: Sequelize.STRING,
        allowNull: true
      },
      quantity_type: {
        type: Sequelize.ENUM(
        'kg', 'tonne', 'quintal', 'l', 'ml', 'm', 'cm', 'pcs', 'metric_cube', 
        'bags', 'feet', 'sheets', 'bundles', 'yard', 'mm','sqft', 'cubic_feet'
        ),
        allowNull: false,
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      product_cost: {
        type: Sequelize.DECIMAL(20,2),
        allowNull: false,
        defaultValue: 0.00,
      },
      product_image: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      isManufactured: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      hsn_code: {
        type: Sequelize.STRING(8),
        allowNull: false,
        validate: {
          is: /^\d{8}$/
        }
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
    await queryInterface.dropTable('Products');
  }
};