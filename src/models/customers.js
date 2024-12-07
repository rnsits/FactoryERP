'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Customers.hasMany(models.Invoice, {
        foreignKey: 'customer_id',
        as: 'invoices'
      });
      Customers.hasMany(models.Customer_Payment, {
        foreignKey: 'customer_id',
        as: 'customer_payments'
      });
    }
  }
  Customers.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [4, 20],
          msg: "Name must be between 4 to 20 characters long."
        }
      },
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      validate: {
        len: {
          args: [10, 255],
          msg: "Address must be between 10-255 characters long."
        }
      },
      allowNull: false
    },
    mobile: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [10,10],
          msg: "Mobile no. must be 10 characters long."
        }
      },
      allowNull: false,
    },
    pincode: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [6,6],
          msg: "pincode must be 6 characters long."
        }
      },
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail:{
          msg: "Invalid Email provided."
        }
      }
    },
    customer_type: {
      type: DataTypes.ENUM("Individual", "Company"),
      allowNull: false
    },
    gstin: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [15,15],
          msg: "GSTIN must be 15 characters long."
        } 
      }
    },
  }, {
    sequelize,
    modelName: 'Customers',
    timestamps: true,
  });
  return Customers;
};