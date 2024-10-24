const express = require("express");
const { Invoice_ItemController } = require("../../controllers");
const { InvoiceItemMiddleware } = require("../../middlewares");
const authenticate = require('../../middlewares/auth.middleware');
const Invoice_ItemRouter = express.Router();


/**
 * /api/v1/auth/InvoiceItem   POST
 */
Invoice_ItemRouter.post('/', InvoiceItemMiddleware.validateBodyRequest, Invoice_ItemController.addInvoiceItem);

/**
 * /api/v1/auth/InvoiceItem/:invoiceItemId   GET
 */
Invoice_ItemRouter.get('/:invoiceItemId', InvoiceItemMiddleware.validateGetRequest, Invoice_ItemController.getInvoiceItem);

/**
 * /api/v1/auth/InvoiceItems/  GET
 */
Invoice_ItemRouter.get('/', Invoice_ItemController.getAllInvoiceItems);

module.exports = Invoice_ItemRouter;