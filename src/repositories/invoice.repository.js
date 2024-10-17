const CrudRepository = require("./crud.repository");
const { Invoice, sequelize } = require("../models");
const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { QueryTypes } = require("sequelize");
const { query } = require("express");

class InvoiceRepository extends CrudRepository {
    constructor() {
      super(Invoice);
    }



}

module.exports = InvoiceRepository;