const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { Customer_PaymentRepository } = require("../repositories");

const customer_PaymentRepository = new Customer_PaymentRepository();

async function createCustomer_Payment(data) {
    try{
        const customer_payment = await customer_PaymentRepository.create(data);
        return customer_payment;
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
        "Cannot create a new customer payment",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
}

async function getCustomerPayment(data) {
    try {
        const customer_payment = await customer_PaymentRepository.get(data);
        return customer_payment;
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
          "Cannot get associated customer payment",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function getAllCustomerPayments() {
    try {
        const customer_payments = await customer_PaymentRepository.getAll();
        return customer_payments;
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
          "Cannot get customer payments.",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

module.exports = {
    createCustomer_Payment,
    getCustomerPayment,
    getAllCustomerPayments
}