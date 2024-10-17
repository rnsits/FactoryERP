const CrudRepository = require("./crud.repository");
const { Category, sequelize } = require("../models");
const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { QueryTypes } = require("sequelize");
const { query } = require("express");

class CategoryRepository extends CrudRepository {
    constructor() {
      super(Category);
    }



}

module.exports = CategoryRepository;