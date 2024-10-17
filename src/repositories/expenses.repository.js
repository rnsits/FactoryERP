const CrudRepository = require("./crud.repository");
const { Expenses, sequelize } = require("../models");
const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { QueryTypes } = require("sequelize");
const { query } = require("express");

class ExpensesRepository extends CrudRepository {
    constructor() {
      super(Expenses);
    }



}

module.exports = ExpensesRepository;