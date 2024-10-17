const CrudRepository = require("./crud.repository");
const { Vendors, sequelize } = require("../models");
const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { QueryTypes } = require("sequelize");
const { query } = require("express");

class VendorsRepository extends CrudRepository {
    constructor() {
      super(Vendors);
    }



}

module.exports = VendorsRepository;