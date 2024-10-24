const CrudRepository = require("./crud.repository");
const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { Balance_Transaction, sequelize } = require("../models");

class BalanceTransactionRepository extends CrudRepository {
    constructor() {
        super(Balance_Transaction);
    }
}

module.exports = BalanceTransactionRepository;
