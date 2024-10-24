const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { CustomersRepository } = require("../repositories");

const customersRepository = new CustomersRepository();


async function createCustomer(data) {
    try{
        const customer = await customersRepository.create(data);
        return customer;
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
        "Cannot create a new customer",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
}

async function getCustomer(data) {
    try {
        const customer = await customersRepository.get(data);
        return customer;
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
          "Cannot get associated customer",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function getAllCustomers() {
    try {
        const customers = await customersRepository.getAll();
        return customers;
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
          "Cannot get customers ",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

module.exports = {
    createCustomer,
    getCustomer,
    getAllCustomers
}