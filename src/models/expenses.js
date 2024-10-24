'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Expenses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Expenses.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    total_cost: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate :{
       len: {
        args: [10, 50],
        msg: 'Description must be between 10 to 50 characters long.'
       }
      }
    },
    description_type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [['text', 'audio']],
          msg: 'Description type must be either text or audio.'
        }
      }
    },
    audio_path: {
      type: DataTypes.STRING,
      allowNull: true
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    payment_status: {
      type: DataTypes.ENUM("paid","unpaid","partial-payment"),
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'Expenses',
    timestamps: true
  });
  return Expenses;
};