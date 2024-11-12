const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { InventoryTransactionRepository } = require("../repositories");
const { InventoryTransaction } = require("../models");
const { Op } = require("sequelize");

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

async function getAllInventoryTransactions(limit, offset, search, fields) {
    try {
        // const inventoryData = await inventoryTransactionRepository.getAll();
        // return inventoryData;
        const where = {};
        
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


module.exports = {
    createInventoryTransaction,
    getInventoryTransaction,
    getAllInventoryTransactions,
    updateInventoryTransaction,
    deleteInventoryTransaction
}