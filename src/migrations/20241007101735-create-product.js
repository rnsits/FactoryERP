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
          args: [10, 500],
          msg: 'Description must be between 10 to 50 characters long.'
         }
        }
      },
      description_type: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isIn: {
            args: [['text', 'audio']],
            msg: 'Description type must be either text or audio.'
          }
        }
      },
      audio_path: {
        type: Sequelize.STRING,
        allowNull: true
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        // references: {
        //   model: 'Category', // Reference to the Category table
        //   key: 'id'
        // },
      },
      quantity_type: {
        type: Sequelize.ENUM(
          'kg', 'tonne', 'quintal', 'l', 'ml', 'm', 'cm', 'pcs', 'metric_cube'
        ),
        allowNull: false,
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      product_cost: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      product_image: {
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
    await queryInterface.dropTable('Products');
  }
};