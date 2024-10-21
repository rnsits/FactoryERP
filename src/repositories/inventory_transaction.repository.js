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



}

module.exports = InventoryTransactionRepository;