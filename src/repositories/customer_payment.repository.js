const CrudRepository = require("./crud.repository");
const { Customer_Payment, sequelize } = require("../models");
const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { QueryTypes } = require("sequelize");
const { query } = require("express");

class Customer_PaymentRepository extends CrudRepository {
    constructor() {
      super(Customer_Payment);
    }



}

module.exports = Customer_PaymentRepository;