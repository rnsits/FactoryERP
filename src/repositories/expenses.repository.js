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

    async findExpensesByDate({ where = {}, limit = 10, offset = 0 }) {
      const response = await Expenses.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });
    
      return response; // Sequelize's `findAndCountAll` already returns { count, rows }
    }


}

module.exports = ExpensesRepository;