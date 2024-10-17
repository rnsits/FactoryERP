const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { InventoryRepository } = require("../repositories");

const inventoryRepository = new InventoryRepository();


async function createInventory(data) {
    try{
        const inventory = await inventoryRepository.create(data);
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
        "Cannot create a new Inventory",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
}

async function getInventory(data) {
    try {
        const inventory = await inventoryRepository.get(data);
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
          "Cannot get associated Inventory",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function getAllInventories() {
    try {
        const inventories = await inventoryRepository.getAll();
        return inventories;
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
          "Cannot get Invoice ",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

module.exports = {
    createInventory,
    getInventory,
    getAllInventories
}