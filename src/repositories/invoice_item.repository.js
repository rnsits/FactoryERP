const CrudRepository = require("./crud.repository");
const { Invoice_Item, sequelize } = require("../models");
const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { QueryTypes } = require("sequelize");
const { query } = require("express");

class Invoice_ItemRepository extends CrudRepository {
    constructor() {
      super(Invoice_Item);
    }



}

module.exports = Invoice_ItemRepository;