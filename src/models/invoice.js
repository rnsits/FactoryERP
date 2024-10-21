'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Invoice.belongsTo(models.Customers, {
        foreignKey: "customer_id",
        as: "customer"
      });

      Invoice.hasMany(models.Invoice_Item, {
        foreignKey: "id",
        "as": "invoice_item"
      });

      Invoice.hasMany(models.Customer_Payment, {
        foreignKey: "invoice_id",
        as: "customer_payments"
      })
    }
  }
  Invoice.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    invoice_id:{
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: ""
    },
    customer_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'Customers',
        key: 'id'
      }
    },
    due_date: {
      allowNull: true,
      type: DataTypes.DATE
    },
    due_amount: {
      allowNull: true,
      type: DataTypes.INTEGER
    },
    payment_status: {
      allowNull: false,
      type: DataTypes.ENUM("paid", "unpaid", "partial paid")
    },
    payment_method: {
      allowNull: false,
      type: DataTypes.ENUM("cash", "digital-payment")
    },
    total_amount: {
      allowNull: true,
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    pincode: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [6 ,6],
          msg: "pincode must be 6 characters long."
        }
      }
    },
    address: {
      type: DataTypes.TEXT,
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
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [10,10],
          msg: "mobile must be 10 characters long."
        }
      }
    },
    customer_payment_image: {
      allowNull: true,
      type: DataTypes.BLOB,
    },
    total_tax: {
      type: DataTypes.FLOAT,
      allowNull: false,  // Final total including tax
      defaultValue: 0
    },
    item_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    }
  }, {
    sequelize,
    modelName: 'Invoice',
    timestamps: true,
    hooks: {
      beforeCreate: async (invoice) => {
        const year = new Date().getFullYear();
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
        const day = new Date().getDate().toString().padStart(2, '0');
        const lastInvoice = await Invoice.findOne({
          order: [['createdAt', 'DESC']],
        });

        // Extract the last increment from the last custom ID
        let lastIncrement = 0;
        if (lastInvoice && lastInvoice.invoice_id) {
          const incrementMatch = lastInvoice.invoice_id.match(/(\d{3})Inv$/);
          if(incrementMatch) {
            lastIncrement = parseInt(incrementMatch[1], 10); // Get the numeric part
          }
          // const lastIncrementString = lastInvoice.invoice_id.split('')[11];
          
          
        }

        // Increment the last value by 1 and pad with 0s to maintain 3 digits
        const newIncrement = (lastIncrement + 1).toString().padStart(3, '0');

        // Set the new custom ID: "2024-00-00-001-Inv"
        invoice.invoice_id = `${year}${month}${day}${newIncrement}Inv`;
      },
    },
  });
  return Invoice;
};