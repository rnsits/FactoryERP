'use strict';

const { default: isEmail } = require('validator/lib/isEmail');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        allowNull: false,
        type: Sequelize.STRING
      },
      password: {
        allowNull: true,
        type: Sequelize.STRING,
        validate: {
          len: {
            args: [60,60],
            msg: "Too Short. Please try again."
          }
        }
      },
      pin: {
        allowNull: true,
        type: Sequelize.STRING,
        validate: {
          len: {
            args: [6,6],
            msg: "Please try again."
          }
        }
      },
      email: {
        allowNull: true,
        type: Sequelize.STRING,
        unique: true,
        validate: {
          isEmail: true,
          msg: "Invalid Email."
        }
      },
      phone: {
        allowNull: false,
        type: Sequelize.STRING,
        validate: {
          args: [10,15],
          msg: "Invalid Phone Number."
        }
      },
      role: {
        allowNull: false,
        type: Sequelize.ENUM("admin", "user"),
        defaultValue: "admin"
      },
      auth_method: {
        type: Sequelize.ENUM("username_password","pin"),
        allowNull: false,
        defaultValue: "username_password"
      },
      current_balance: {
        allowNull: false,
        type: Sequelize.DECIMAL(20, 2),
        defaultValue: 0.00
      },
      refreshToken: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      refreshTokenExpiry: {
        type: Sequelize.DATE,
        allowNull: true,
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
    await queryInterface.dropTable('Users');
  }
};