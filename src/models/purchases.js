'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Purchases extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Purchases.belongsTo(models.Vendors, {
        foreignKey: 'vendor_id',
        as: 'vendor', // This will be used to fetch the vendor of the purchase
      });
      Purchases.belongsTo(models.Product,{
        foreignKey: 'product_id',
        as: 'product',
      })
    }
  }
  Purchases.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity_type: {
      type: DataTypes.ENUM(
        'kg', 'tonne', 'quintal', 'l', 'ml', 'm', 'cm', 'pcs', 'metric_cube'
      ),
      allowNull: false
    },
    total_cost: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    payment_status: {
      type: DataTypes.ENUM("paid", "unpaid", "partial-payment"),
      allowNull: false
    },
    payment_due_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Vendors',
        key: 'id'
      }
    },
    invoice_Bill: {
      type: DataTypes.TEXT('long'), // done today
      allowNull: true
    },
    due_amount: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      defaultValue: 0.00
    }
  }, {
    sequelize,
    modelName: 'Purchases',
    timestamps: true
  });
  return Purchases;
};