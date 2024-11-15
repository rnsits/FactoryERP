const express = require("express");
const { PurchaseController } = require("../../controllers");
const { PurchasesMiddleware } = require("../../middlewares");
const PurchaseRouter = express.Router();
const { authenticateToken } = require('../../middlewares/auth.middleware');

/**
 * /api/v1/auth/purchases   POST
 */
PurchaseRouter.post('/', authenticateToken, PurchasesMiddleware.validateBodyRequest, PurchaseController.addPurchase);

/**
 * /api/v1/auth/purchases
 */
PurchaseRouter.get('/today', authenticateToken, PurchaseController.getTodayPurchases);
PurchaseRouter.get('/unpaidpur', authenticateToken, PurchaseController.getUnPaidPurchases);
PurchaseRouter.post('/purDat', authenticateToken, PurchasesMiddleware.validateDateBody, PurchaseController.getPurchasesByDate);

/**
 * /api/v1/auth/purchases/:Id   GET
 */
PurchaseRouter.get('/:purchaseId', authenticateToken, PurchasesMiddleware.validateGetRequest, PurchaseController.getPurchase);

/**
 * /api/v1/auth/purchases/  GET
 */
PurchaseRouter.get('/', authenticateToken, PurchaseController.getAllPurchases);

module.exports = PurchaseRouter;