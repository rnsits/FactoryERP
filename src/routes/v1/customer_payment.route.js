const express = require("express");
const { CustomerPaymentController } = require("../../controllers");
const {  } = require("../../middlewares");
const authenticate = require('../../middlewares/auth.middleware');
const CustomerPaymentRoutes = express.Router();

/**
 * /api/v1/auth/CustomerPayment   POST
 */
CustomerPaymentRoutes.post('/', CustomerPaymentController.addCustomerPayment);

/**
 * /api/v1/auth/CustomerPayment/:CustomerPaymentId   GET
 */
CustomerPaymentRoutes.get('/:customerPaymentId', CustomerPaymentController.getCustomerPayment);

/**
 * /api/v1/auth/CustomerPayments/  GET
 */
CustomerPaymentRoutes.get('/', CustomerPaymentController.getAllCustomerPayments);

module.exports = CustomerPaymentRoutes;