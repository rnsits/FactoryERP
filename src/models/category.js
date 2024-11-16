'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Category.hasMany(models.Product, {
      //   foreignKey: 'category_id', // Foreign key in Product model
      //   as: 'products', // Alias for the association
      // });
    }
  }
  Category.init({
    id: {
      type: DataTypes.INTEGER, // Change to INTEGER if you're using auto-increment
      allowNull: false,
      autoIncrement: true, // Optional if you want the id to auto-increment
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [3, 20],
          msg: "Name must be between 3 to 20 characters long.",
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [10, 50],
          msg: 'Description must be between 10 to 50 characters long.',
        },
      },
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
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'Categories',
    timestamps: true
  });
  return Category;
};