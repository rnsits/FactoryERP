const express = require("express");
const { PurchaseController } = require("../../controllers");
const { PurchasesMiddleware } = require("../../middlewares");
const PurchaseRouter = express.Router();

/**
 * /api/v1/auth/purchases   POST
 */
PurchaseRouter.post('/', PurchasesMiddleware.validateBodyRequest, PurchaseController.addPurchase);

/**
 * /api/v1/auth/purchases
 */
PurchaseRouter.get('/today', PurchaseController.getTodayPurchases);
PurchaseRouter.post('/purDat', PurchasesMiddleware.validateDateBody, PurchaseController.getPurchasesByDate);

/**
 * /api/v1/auth/purchases/:Id   GET
 */
PurchaseRouter.get('/:purchaseId', PurchasesMiddleware.validateGetRequest, PurchaseController.getPurchase);

/**
 * /api/v1/auth/purchases/  GET
 */
PurchaseRouter.get('/', PurchaseController.getAllPurchases);

module.exports = PurchaseRouter;