const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { InventoryTransactionRepository } = require("../repositories");
const { InventoryTransaction } = require("../models");
const { Op, where } = require("sequelize");

const inventoryTransactionRepository = new InventoryTransactionRepository();

async function createInventoryTransaction(data) {
    try{
        const inventory = await inventoryTransactionRepository.create(data);
        return inventory;
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
        "Cannot create a Inventory Data.",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
}

async function getInventoryTransaction(data) {
    try {
        const inventory = await inventoryTransactionRepository.get(data);
        return inventory;
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
          "Cannot get Invoice_Item associate with the field",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function getAllInventoryTransactions(limit, offset, search, fields, filter) {
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

    const { count, rows } = await InventoryTransaction.findAndCountAll({
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
          "Cannot get Inventory Transaction Data.",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function updateInventoryTransaction(inventoryTransactionId,data){
    try {
      const inventory = await inventoryTransactionRepository.update(inventoryTransactionId,data);
      return inventory;
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
        "Cannot get Inventory Transactions Data",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
  }

}

async function deleteInventoryTransaction(inventoryTransactionId) {
    try {
        const inventory = await inventoryTransactionRepository.destroy(inventoryTransactionId);
    }catch(error) {
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
          "Cannot get Inventory Transactions Data",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function getDamagedProductsData(limit, offset, search, fields) {
  try{

    const where = { isDamaged: true };
    if (search && fields.length > 0) {
      where[Op.or] = fields.map(field => ({
          [field]: { [Op.like]: `%${search}%` }
      }));
    }
    const { count, rows } = await InventoryTransaction.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
    return { count, rows };
  }catch(error){
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
          "Cannot get Inventory Transactions Data",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
  }
}
async function getDamagedDataByDate(date, limit, offset, search, fields) {
  try{
    const where = { isDamaged: true };
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

    const { count, rows } = await InventoryTransaction.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
    return { count, rows };
  } catch(error){
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
          "Cannot get Inventory Transactions Data",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
  }
}


module.exports = {
    createInventoryTransaction,
    getInventoryTransaction,
    getAllInventoryTransactions,
    updateInventoryTransaction,
    deleteInventoryTransaction,
    getDamagedProductsData,
    getDamagedDataByDate
}