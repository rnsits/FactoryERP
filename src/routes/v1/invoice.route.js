const express = require("express");
const { InvoiceController } = require("../../controllers");
const { InvoiceMiddleware } = require("../../middlewares");
const InvoiceRouter = express.Router();


/**
 * /api/v1/auth/invoices   POST
 */
InvoiceRouter.post('/', InvoiceMiddleware.validateBodyRequest, InvoiceController.addInvoice);

/**
 * /api/v1/auth/invoices/:invoice_id   GET
 */
InvoiceRouter.get('/peninv', InvoiceController.getPendingInvoices);
InvoiceRouter.get('/todInv', InvoiceController.getTodayInvoices);
InvoiceRouter.get('/:invoiceId', InvoiceMiddleware.validateGetRequest, InvoiceController.getInvoice);

/**
 * /api/v1/auth/invoices/  GET
 */
InvoiceRouter.get('/', InvoiceController.getAllInvoices);

module.exports = InvoiceRouter;