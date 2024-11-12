const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { CategoryRepository } = require("../repositories");
const { Category } = require("../models");
const { Op } = require("sequelize");

const categoryRepository = new CategoryRepository();


async function createCategory(data) {
    try{
        const category = await categoryRepository.create(data);
        return category;
      }catch(error){
        console.log(error);
      if (
        error.name == "SequelizeValidationError" ||
        error.name == "SequelizeUniqueConstraintError"
      ) {
        let explanation = [];
        error.errors.forEach((err) => {
          explanation.push(err.message);
        });
        throw new AppError(explanation, StatusCodes.BAD_REQUEST);
      }
      throw new AppError(
        "Cannot create a new category",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
}

async function getCategory(data) {
    try {
        const category = await categoryRepository.get(data);
        return category;
    } catch(error) {
        console.log(error);
        if(
            error.name == "SequelizeValidationError" ||
            error.name == "SequelizeUniqueConstraintError"
        ) {
          let explanation = [];
          error.errors.forEach((err) => {
            explanation.push(err.message);
          });
          throw new AppError(explanation, StatusCodes.BAD_REQUEST);
        } else if (
          error.name === "SequelizeDatabaseError" &&
          error.original &&
          error.original.routine === "enum_in"
        ) {
          throw new AppError(
            "Invalid value for associate_with field.",
            StatusCodes.BAD_REQUEST
          );
        }
        throw new AppError(
          "Cannot get associated category",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function getAllCategories(limit, offset, search, fields) {
    try {

        const where = {};
        
        if (search && fields.length > 0) {
            where[Op.or] = fields.map(field => ({
                [field]: { [Op.like]: `%${search}%` }
            }));
        }

    const { count, rows } = await Category.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  return { count, rows };
    } catch(error) {
        console.log(error);
        if(
            error.name == "SequelizeValidationError" ||
            error.name == "SequelizeUniqueConstraintError"
        ) {
          let explanation = [];
          error.errors.forEach((err) => {
            explanation.push(err.message);
          });
          throw new AppError(explanation, StatusCodes.BAD_REQUEST);
        } else if (
          error.name === "SequelizeDatabaseError" &&
          error.original &&
          error.original.routine === "enum_in"
        ) {
          throw new AppError(
            "Invalid value for associate_with field.",
            StatusCodes.BAD_REQUEST
          );
        }
        throw new AppError(
          "Cannot get Categories.",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

module.exports = {
    createCategory,
    getCategory,
    getAllCategories
}