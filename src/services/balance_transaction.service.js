const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { BalanceTransactionRepository } = require("../repositories");
const { Balance_Transaction } = require("../models");
const { Op } = require("sequelize");

const balanceTransactionRepository = new BalanceTransactionRepository();

async function createBalanceTransactions(data) {
    try{
        const balance = await balanceTransactionRepository.create(data);
        return balance;
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
        "Cannot create a new balance transaction.",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
}

async function getAllBalanceTransactions(limit, offset, search, fields){
  try {
    const where = {};
        
        if (search && fields.length > 0) {
            where[Op.or] = fields.map(field => ({
                [field]: { [Op.like]: `%${search}%` }
            }));
        }

    const { count, rows } = await Balance_Transaction.findAndCountAll({
      where,
      limit,
      offset,
    });
  return { count, rows };
  } catch (error) {
    ErrorResponse.message = "Failed to fetch Balance Transactions.";
    ErrorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}



module.exports = {
    createBalanceTransactions,
    getAllBalanceTransactions
}