'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Vendors extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Vendors.hasMany(models.Purchases, {
        foreignKey: 'vendor_id',
        as: 'purchases',
      });
    }
  }
  Vendors.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len:{
          args: [3, 30],
          msg: "Name must be between 3-30 characters long."
        }
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [10, 255],
          msg: "Address must be between 10-225 characters long."
        }
      }
    },
    contact_person: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [10, 10],
          msg: "Mobile Number must be 10 characters long."
        }
      }
    },
    pincode: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [6, 6],
          msg: "Pincode must be 6 characters long."
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
      validate: {
        isEmail: { msg: "Invalid email." }
      }
    },
  }, {
    sequelize,
    modelName: 'Vendors',
    timestamps: true
  });
  return Vendors;
};