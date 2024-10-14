'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Customers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        validate: {
          len: {
            args: [4, 20],
            msg: "Name must be between 4 to 20 characters long."
          }
        },
        allowNull: false
      },
      address: {
        type: Sequelize.TEXT,
        validate: {
          len: {
            args: [10, 255],
            msg: "Address must be between 10-255 characters long."
          }
        },
        allowNull: false
      },
      mobile: {
        type: Sequelize.STRING,
        validate: {
          len: {
            args: [10,10],
            msg: "Mobile no. must be 10 characters long."
          }
        },
        allowNull: false,
      },
      pincode: {
        type: Sequelize.STRING,
        validate: {
          len: {
            args: [6,6],
            msg: "pincode must be 6 characters long."
          }
        },
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        validate: {
          isEmail:{
            msg: "Invalid Email provided."
          }
        },
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
    await queryInterface.dropTable('Customers');
  }
};