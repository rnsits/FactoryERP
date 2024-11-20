const express = require("express");
const { InvoiceController } = require("../../controllers");
const { InvoiceMiddleware } = require("../../middlewares");
const { authenticateToken } = require('../../middlewares/auth.middleware');
const upload = require("../../config/multer.config");
const InvoiceRouter = express.Router();

/**
 * /api/v1/auth/invoices   POST
 */
InvoiceRouter.post('/', authenticateToken, 
    upload.fields([
        { name: 'customer_payment_image', maxCount: 1 }, // Single image file
        {name: 'audio', maxCount: 1 }  // Single audio file,
      ]), InvoiceController.addInvoice);   
InvoiceRouter.post('/invoicedate', authenticateToken, InvoiceController.getInvoicesByDate);

/**
 * /api/v1/auth/invoices/:invoice_id   GET
 */
InvoiceRouter.get('/peninv', authenticateToken, InvoiceController.getPendingInvoices);
InvoiceRouter.get('/todInv', authenticateToken, InvoiceController.getTodayInvoices);
InvoiceRouter.get('/:invoiceId', authenticateToken, InvoiceMiddleware.validateGetRequest, InvoiceController.getInvoice);

/**
 * /api/v1/auth/invoices/  GET
 */
InvoiceRouter.get('/', InvoiceController.getAllInvoices);

module.exports = InvoiceRouter;