'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Invoices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      invoice_id:{
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      customer_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Customers',
          key: 'id'
        }
      },
      due_date: {
        allowNull: true,
        type: Sequelize.DATE
      },
      due_amount: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      payment_status: {
        allowNull: false,
        type: Sequelize.ENUM("paid", "unpaid", "partial paid")
      },
      payment_method: {
        allowNull: false,
        type: Sequelize.ENUM("cash", "digital-payment")
      },
      total_amount: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      pincode: {
        allowNull: false,
        type: Sequelize.STRING,
        validate: {
          len: {
            args: [6 ,6],
            msg: "pincode must be 6 characters long."
          }
        }
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          len: {
            args: [10, 255],
            msg: "address must be 10-255 characters long."
          }
        }
      },
      mobile: {
        allowNull: true,
        type: Sequelize.STRING,
        validate: {
          len: {
            args: [10,10],
            msg: "mobile must be 10 characters long."
          }
        }
      },
      payment_image: {            // done today
        allowNull: true,
        type: Sequelize.TEXT('long'),
        defaultValue: null
      },
      total_tax: {
        allowNull: false,
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      item_count: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER
      },
      items: {
        allowNull: false,
        type: Sequelize.JSON,
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
    await queryInterface.dropTable('Invoices');
  }
};