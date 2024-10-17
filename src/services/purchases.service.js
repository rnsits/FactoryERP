const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { PurchasesRepository } = require("../repositories");

const purchaseRepository = new PurchasesRepository();


async function createPurchase(data) {
    try{
        const purchase = await purchaseRepository.create(data);
        return purchase;
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
        "Cannot create a new Purchase",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
}

async function getPurchase(data) {
    try {
        const purchase = await purchaseRepository.get(data);
        return purchase;
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
          "Cannot get Purchase associate with the field",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function getAllPurchases() {
    try {
        const purchases = await purchaseRepository.getAll();
        return purchases;
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
          "Cannot get Purchases ",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

module.exports = {
    createPurchase,
    getPurchase,
    getAllPurchases
}