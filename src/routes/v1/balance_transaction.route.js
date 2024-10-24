const express = require("express");
const { BalanceTransactionController } = require("../../controllers");
const { BalanceTransactionMiddleware } = require("../../middlewares");
const authenticate = require('../../middlewares/auth.middleware');
const BalanTranRouter = express.Router();

/**
 * /api/v1/auth/baltran   POST
 */
BalanTranRouter.post('/', BalanceTransactionMiddleware.validateBodyRequest, BalanceTransactionController.addBalanceTransactions);


module.exports = BalanTranRouter;