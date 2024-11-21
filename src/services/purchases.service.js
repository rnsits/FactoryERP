const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { PurchasesRepository } = require("../repositories");
const { Purchases } = require("../models");
const { Op } = require("sequelize");

const purchaseRepository = new PurchasesRepository();


async function createPurchase(data) {
    try{
        const purchase = await purchaseRepository.create(data);
        return purchase;
      }catch(error){
        console.log("Purchase creation error:", error);
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

async function getAllPurchases(limit, offset, search, fields, filter) {
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
    
        const { count, rows } = await Purchases.findAndCountAll({
          where,
          attributes: fields.length > 0 ? fields : undefined,
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
          "Cannot get Purchases ",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function getTodayPurchases(limit, offset, search, fields) {
  try {
      const where = {};
        
      if (search && fields.length > 0) {
          where[Op.or] = fields.map(field => ({
              [field]: { [Op.like]: `%${search}%` }
          }));
      }

      const { count, rows } = await purchaseRepository.findToday({
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
        "Cannot get Purchases. ",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
  }
}

async function getPurchasesByDate(date, limit, offset, search, fields) {
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

      if (search && fields.length > 0) {
          where[Op.or] = fields.map(field => ({
              [field]: { [Op.like]: `%${search}%` }
          }));
      } 

      // const purchases = await purchaseRepository.findAll(date);
      // return purchases;
      const { count, rows } = await purchaseRepository.findPurchasesByDate({
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
        "Cannot get Purchases. ",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
  }
}
async function getUnPaidPurchases(limit, offset, search, fields) {
  try {
    const where = { 
      payment_status: {
        [Op.notIn]: ['paid']
      }
    };
    if (search && fields.length > 0) {
      where[Op.or] = fields.map(field => ({
          [field]: { [Op.like]: `%${search}%` }
      }));
    }
    const { count, rows } = await Purchases.findAndCountAll({
      where,
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
      "Cannot get Purchases. ",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
    }
}

module.exports = {
    createPurchase,
    getPurchase,
    getAllPurchases,
    getTodayPurchases,
    getPurchasesByDate,
    getUnPaidPurchases
}