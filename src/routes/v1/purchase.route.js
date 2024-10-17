const express = require("express");
const { PurchaseController } = require("../../controllers");
const { PurchasesMiddleware } = require("../../middlewares");
const PurchaseRouter = express.Router();

/**
 * /api/v1/auth/Purchase   POST
 */
PurchaseRouter.post('/', PurchasesMiddleware.validateBodyRequest, PurchaseController.addPurchase);

/**
 * /api/v1/auth/Purchase/:Id   GET
 */
PurchaseRouter.get('/:purchaseId', PurchasesMiddleware.validateGetRequest, PurchaseController.getPurchase);

/**
 * /api/v1/auth/Purchases/  GET
 */
PurchaseRouter.get('/', PurchaseController.getAllPurchases);

module.exports = PurchaseRouter;