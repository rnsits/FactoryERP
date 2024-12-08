'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Expenses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      total_cost: {
        type: Sequelize.DECIMAL(20,2),
        allowNull: false,
        defaultValue: 0.00
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        validate :{
         len: {
          args: [5, 50],
          msg: 'Description must be between 5 to 50 characters long.'
         }
        }
      },
      description_type: {
        type: Sequelize.ENUM('text', 'audio'),
        allowNull: false,
      },
      audio_path: {
        type: Sequelize.STRING, // done yesterday
        allowNull: true
      },
      payment_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      payment_status: {
        type: Sequelize.ENUM("paid","unpaid","partial-payment"),
        allowNull: false
      },
      due_amount: {
        type: Sequelize.DECIMAL(20,2),
        allowNull: true,
        defaultValue: 0.00
      },
      due_date: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable('Expenses');
  }
};