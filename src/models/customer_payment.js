'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customer_Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Customer_Payment.belongsTo(models.Customers, {
        foreignKey: 'customer_id',
        as: 'customer'
      });

      Customer_Payment.belongsTo(models.Invoice, {
        foreignKey: "invoice_id",
        as: 'invoice'
      })
    }
  }

  Customer_Payment.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    customer_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'Customers',
        key: 'id'
      }
    },
    invoice_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Invoices',
        key: 'id'
      }
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    amount: {
      allowNull: false,
      type: DataTypes.DECIMAL(20,2),
      defaultValue: 0.00
    },
    payment_method: {
      allowNull: false,
      type: DataTypes.ENUM("cash", "digital-payment")
    },
    payment_status: {
      allowNull: false,
      type: DataTypes.ENUM("paid","unpaid","partial-paid")
    },
  }, {
    sequelize,
    modelName: 'Customer_Payment',
    timestamps: true
  });
  return Customer_Payment;
};