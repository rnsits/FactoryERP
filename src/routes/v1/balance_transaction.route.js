const express = require("express");
const { BalanceTransactionController } = require("../../controllers");
const { BalanceTransactionMiddleware } = require("../../middlewares");
const { authenticateToken } = require('../../middlewares/auth.middleware');
const BalanTranRouter = express.Router();

/**
 * /api/v1/auth/baltran   POST
 */
BalanTranRouter.post('/', authenticateToken, BalanceTransactionMiddleware.validateBodyRequest, BalanceTransactionController.addBalanceTransactions);

BalanTranRouter.get('/', authenticateToken, BalanceTransactionController.getBalanceTransactions);


module.exports = BalanTranRouter;