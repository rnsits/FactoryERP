'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Vendors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [3, 30],
            msg: "Name must be between 3-30 characters long."
          }
        }
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          len: {
            args: [10, 255],
            msg: "Address must be between 10-225 characters long."
          }
        }
      },
      contact_person: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      mobile: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [10, 10],
            msg: "Mobile Number must be 10 characters long."
          }
        }
      },
      pincode: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [6, 6],
            msg: "Pincode must be 6 characters long."
          }
        }
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
        validate: {
          isEmail: { msg: "Invalid email." }
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
    await queryInterface.dropTable('Vendors');
  }
};