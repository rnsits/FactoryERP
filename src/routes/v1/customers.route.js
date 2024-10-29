const express = require("express");
const { CustomerController } = require("../../controllers");
const { CustomerMiddleware } = require("../../middlewares");
const { authenticateToken } = require('../../middlewares/auth.middleware');
const CustomerRoutes = express.Router();

/**
 * /api/v1/auth/Customer   POST
 */
CustomerRoutes.post('/', authenticateToken, CustomerMiddleware.validateBodyRequest, CustomerController.addCustomers);

/**
 * /api/v1/auth/Customer/:CustomerId   GET
 */
CustomerRoutes.get('/:customerId', authenticateToken, CustomerMiddleware.validateGetRequest, CustomerController.getCustomer);

/**
 * /api/v1/auth/Customers/  GET
 */
CustomerRoutes.get('/', authenticateToken, CustomerController.getAllCustomers);

module.exports = CustomerRoutes;