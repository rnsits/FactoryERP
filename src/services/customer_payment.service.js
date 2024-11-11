const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { Customer_PaymentRepository } = require("../repositories");
const { Customer_Payment } = require("../models");
const { Op } = require("sequelize");

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

async function getAllCustomerPayments(limit, offset, search, fields) {
    try {
        // const customer_payments = await customer_PaymentRepository.getAll();
        // return customer_payments;
        const where = {};
        
        if (search && fields.length > 0) {
            where[Op.or] = fields.map(field => ({
                [field]: { [Op.like]: `%${search}%` }
            }));
        }

    const { count, rows } = await Customer_Payment.findAndCountAll({
      where,
      limit,
      offset,
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
          "Cannot get customer payments.",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

// async function getUnpaidCustomerPayments(limit, offset, search, fields) {
//   try {
//       // const customer_payments = await customer_PaymentRepository.getAll();
//       // return customer_payments;
//       const where = {
//         payment_status: {
//           [Op.in]: ["unpaid", "partial-paid"]
//         }
//       };
      
//       if (search && fields.length > 0) {
//           where[Op.or] = fields.map(field => ({
//               [field]: { [Op.like]: `%${search}%` }
//           }));
//       }

//       const { count, rows } = await Customer_Payment.findAndCountAll({
//         where,
//         limit,
//         offset,
//       });

//       if (count === 0) {
//         throw new AppError("No unpaid payments found", StatusCodes.NOT_FOUND);
//       }
      
//       return { count, rows };  
      
//   } catch(error) {
//       console.log(error);
//       if(
//           error.name == "SequelizeValidationError" ||
//           error.name == "SequelizeUniqueConstraintError"
//       ) {
//         let explanation = [];
//         error.errors.forEach((err) => {
//           explanation.push(err.message);
//         });
//         throw new AppError(explanation, StatusCodes.BAD_REQUEST);
//       } else if (
//         error.name === "SequelizeDatabaseError" &&
//         error.original &&
//         error.original.routine === "enum_in"
//       ) {
//         throw new AppError(
//           "Invalid value for associate_with field.",
//           StatusCodes.BAD_REQUEST
//         );
//       }
//       throw new AppError(
//         "Cannot get customer payments.",
//         StatusCodes.INTERNAL_SERVER_ERROR
//       );
//   }
// }

module.exports = {
    createCustomer_Payment,
    getCustomerPayment,
    getAllCustomerPayments,
    // getUnpaidCustomerPayments
}