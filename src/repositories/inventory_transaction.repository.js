const CrudRepository = require("./crud.repository");
const { InventoryTransaction } = require("../models")
const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { QueryTypes } = require("sequelize");
const { query } = require("express");

class InventoryTransactionRepository extends CrudRepository {
    constructor() {
      super(InventoryTransaction);
    }

    async bulkCreate(transactions, options = {}) {
      try {
          // Using Sequelize's bulkCreate method
          return await InventoryTransaction.bulkCreate(transactions, options);
      } catch (error) {
          console.error("Error in bulk creating inventory transactions:", error);
          throw new Error("Bulk create failed");
      }
  }

}

module.exports = InventoryTransactionRepository;