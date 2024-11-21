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

async function getAllBalanceTransactions(limit, offset, search, fields, filter){
  try {
    const where = {};
        
        if (search && fields.length > 0) {
            where[Op.or] = fields.map(field => ({
                [field]: { [Op.like]: `%${search}%` }
            }));
        }

        // Handle filtering
        if (filter && typeof filter === 'string') {
          const [key, value] = filter.split(':');
          if (key && value) {
              where[key] = {[Op.like]: `%${value}%`};
          }
        }

    const { count, rows } = await Balance_Transaction.findAndCountAll({
      where,
      attributes: fields.length > 0 ? fields : undefined,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  return { count, rows };
  } catch (error) {
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
          "Failed to get Balance Transactions.",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
  }
}



module.exports = {
    createBalanceTransactions,
    getAllBalanceTransactions
}