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

async findInvoicesByDate({ where = {}, limit = 10, offset = 0 }) {
  const response = await Invoice.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });
  return response;
}

}

module.exports = InvoiceRepository;