const CrudRepository = require("./crud.repository");
const { Customers, sequelize } = require("../models");
const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { QueryTypes } = require("sequelize");
const { query } = require("express");

class CustomersRepository extends CrudRepository {
    constructor() {
      super(Customers);
    }



}

module.exports = CustomersRepository;