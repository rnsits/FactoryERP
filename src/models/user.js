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
          args: [8,20],
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
          msg: "Please try again."
        }
      }
    },
    email: {
      allowNull: true,
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: true,
        msg: "Invalid Email."
      }
    },
    phone: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        args: [10,15],
        msg: "Invalid Phone Number."
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
  }, {
    sequelize,
    modelName: 'User',
    timestamps: true,
  });
  return User;
};