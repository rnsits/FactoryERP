'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Invoice_Item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Invoice_Item.belongsTo(models.Invoice, {
        foreignKey: 'invoice_item_id',
        as: 'invoice',
      });

      Invoice_Item.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product',
      })
    }
  }
  Invoice_Item.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    invoice_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Product',
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
    unit_price: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    total_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    gst_amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0
    },
    sgst_amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0
    },
    igst_amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0
    },
    item_image: {
      type: DataTypes.BLOB,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Invoice_Item',
    timestamps: true,
  });
  return Invoice_Item;
};