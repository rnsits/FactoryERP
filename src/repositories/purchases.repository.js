const CrudRepository = require("./crud.repository");
const { Purchases, sequelize } = require("../models");
const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { QueryTypes } = require("sequelize");
const { query } = require("express");

class PurchasesRepository extends CrudRepository {
    constructor() {
      super(Purchases);
    }

    async findPurchasesByDate({ where = {}, limit = 10, offset = 0 }) {
      const response = await Purchases.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });
    
      return response;
    }

}

module.exports = PurchasesRepository;