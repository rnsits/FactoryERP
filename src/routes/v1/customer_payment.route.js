const express = require("express");
const { CustomerPaymentController } = require("../../controllers");
const {  } = require("../../middlewares");
const { authenticateToken } = require('../../middlewares/auth.middleware');
const CustomerPaymentRoutes = express.Router();

/**
 * /api/v1/auth/CustomerPayment   POST
 */
CustomerPaymentRoutes.post('/', authenticateToken, CustomerPaymentController.addCustomerPayment);

/**
 * /api/v1/auth/CustomerPayment/:CustomerPaymentId   GET
 */
CustomerPaymentRoutes.get('/:customerPaymentId', authenticateToken, CustomerPaymentController.getCustomerPayment);

/**
 * /api/v1/auth/CustomerPayments/  GET
 */
CustomerPaymentRoutes.get('/', authenticateToken, CustomerPaymentController.getAllCustomerPayments);

// getting unpaid customer payments
// CustomerPaymentRoutes.get('/unpaid', authenticateToken, CustomerPaymentController.getUnpaidCustomerPayments);

module.exports = CustomerPaymentRoutes;