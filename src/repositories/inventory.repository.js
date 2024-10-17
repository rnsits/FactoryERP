const CrudRepository = require("./crud.repository");
const { Inventory, sequelize } = require("../models");
const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { QueryTypes } = require("sequelize");
const { query } = require("express");

class InventoryRepository extends CrudRepository {
    constructor() {
      super(Inventory);
    }



}

module.exports = InventoryRepository;