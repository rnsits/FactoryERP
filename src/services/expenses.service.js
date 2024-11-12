const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { ExpensesRepository } = require("../repositories");
const { Expenses } = require("../models");
const { Op } = require("sequelize");

const expensesRepository = new ExpensesRepository();


async function createExpense(data) {
    try{
        const expense = await expensesRepository.create(data);
        return expense;
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
        "Cannot create a new expense",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
}

async function getExpense(data) {
    try {
        const expense = await expensesRepository.get(data);
        return expense;
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
          "Cannot get associated expense",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function getAllExpenses(limit, offset, search, fields) {
    try {
        const where = {};
        
        if (search && fields.length > 0) {
            where[Op.or] = fields.map(field => ({
                [field]: { [Op.like]: `%${search}%` }
            }));
        }

    const { count, rows } = await Expenses.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  return { count, rows };
        // return res.status(StatusCodes.OK).json(SuccessResponse);
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
          "Cannot get Expenses ",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}


async function getTodayExpenses(limit, offset, search, fields) {
  try {
    const where = {};
        
    if (search && fields.length > 0) {
        where[Op.or] = fields.map(field => ({
            [field]: { [Op.like]: `%${search}%` }
        }));
    }
      const { count, rows } = await expensesRepository.findToday({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });
      // return expenses;
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
        "Cannot get Expenses.",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
  }
}

async function getExpensesByDate(date, limit, offset, search, fields) {
  try {   
      const where = {};

      // Filter expenses by the specified date (date is already a Date object)
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(24, 0, 0, 0);

      // Add the date filter to `where` clause
      where.createdAt = {
        [Op.gte]: startOfDay,
        [Op.lt]: endOfDay,
      };

      // If search query and fields are provided, add the search condition
      if (search && fields.length > 0) {
        where[Op.or] = fields.map((field) => ({
          [field]: { [Op.like]: `%${search}%` }
        }));
      } 
      // const expenses = await expensesRepository.findAll(date);
      // return expenses;
      // Fetch expenses from the database with pagination
      const { count, rows } = await expensesRepository.findExpensesByDate({
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
        "Cannot get Expenses.",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
  }
}

module.exports = {
    createExpense,
    getExpense,
    getAllExpenses,
    getTodayExpenses,
    getExpensesByDate
}