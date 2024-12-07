const express = require("express");
const { PurchaseController } = require("../../controllers");
const { PurchasesMiddleware } = require("../../middlewares");
const PurchaseRouter = express.Router();
const { authenticateToken } = require('../../middlewares/auth.middleware');
// const upload = require("../../config/multer.config");
const {imageUpload, audioUpload, multerMiddleware} = require("../../config/multer.config");

/**
 * /api/v1/auth/purchases   POST
 */
PurchaseRouter.post('/', authenticateToken, multerMiddleware(imageUpload('invoice_Bill')), PurchasesMiddleware.validateBodyRequest, PurchaseController.addPurchase);

/**
 * /api/v1/auth/purchases   PUT
 */
PurchaseRouter.put('/mrkpur', authenticateToken, PurchasesMiddleware.validateMrkPaidPurchase, PurchaseController.markPurchasePaid);

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