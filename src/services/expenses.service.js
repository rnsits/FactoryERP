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
        // const expenses = await expensesRepository.getAll();
        // return expenses;
        // const page = parseInt(req.query.page) || 1; 
        // const limit = parseInt(req.query.limit) || 10;
        // const offset = (page - 1) * limit; 
        // const search = req.query.search || '';
        // const fields = req.query.fields ? req.query.fields.split(',') : [];

        // const { count, rows } = await ExpensesService.getAllExpenses(limit, offset, search);

        // SuccessResponse.message = "Expenses retrieved successfully.";
        // SuccessResponse.data = {
        //     products: rows,
        //     totalCount: count, 
        //     totalPages: Math.ceil(count / limit), 
        //     currentPage: page,
        //     pageSize: limit
        // };
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


async function getTodayExpenses() {
  try {
      const expenses = await expensesRepository.findToday();
      return expenses;
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

async function getExpensesByDate(date) {
  try {    
      const expenses = await expensesRepository.findAll(date);
      return expenses;
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