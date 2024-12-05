'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    username: {
      allowNull: false,
      type: DataTypes.STRING
    },
    password: {
      allowNull: true,
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [60,60],
          msg: "Too Short. Please try again."
        }
      } 
    },
    pin: {
      allowNull: true,
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [6,6],
          msg: "Pin length must be atleast 6."
        }
      }
    },
    email: {
      allowNull: true,
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: true,
      }
    },
    phone: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        isLength: {
          args: { min: 10, max: 15 },
          msg: "Phone number must be between 10 and 15 characters long."
        },
        is: {
          args: /^\d+$/, // Check if the phone number contains only digits
          msg: "Phone number must contain only digits."
        }
      }
    },    
    role: {
      allowNull: false,
      type: DataTypes.ENUM("admin", "user"),
      defaultValue: "admin"
    },
    auth_method: {
      type: DataTypes.ENUM("username_password","pin"),
      allowNull: false,
      defaultValue: "username_password"
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    refreshTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    current_balance: {
      allowNull: false,
      type: DataTypes.DECIMAL(20,2),
      defaultValue: 0.00
    },
  }, {
    sequelize,
    modelName: 'User',
    timestamps: true,
  });
  return User;
};