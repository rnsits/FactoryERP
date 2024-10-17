const CrudRepository = require("./crud.repository");
const { Product, sequelize } = require("../models");
const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { QueryTypes } = require("sequelize");
const { query } = require("express");

class ProductRepository extends CrudRepository {
    constructor() {
      super(Product);
    }



}

module.exports = ProductRepository;