const express = require("express");
const { InvoiceController } = require("../../controllers");
const { InvoiceMiddleware } = require("../../middlewares");
const InvoiceRouter = express.Router();




/**
 * /api/v1/auth/Invoice   POST
 */
InvoiceRouter.post('/', InvoiceMiddleware.validateBodyRequest, InvoiceController.addInvoice);

/**
 * /api/v1/auth/Invoice/:invoice_id   GET
 */
InvoiceRouter.get('/:invoiceId', InvoiceMiddleware.validateGetRequest, InvoiceController.getInvoice);

/**
 * /api/v1/auth/Invoices/  GET
 */
InvoiceRouter.get('/', InvoiceController.getAllInvoices);

module.exports = InvoiceRouter;