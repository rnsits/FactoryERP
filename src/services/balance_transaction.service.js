const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { BalanceTransactionRepository } = require("../repositories");

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

module.exports = {
    createBalanceTransactions
}