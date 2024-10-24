const express = require("express");
const { CustomerController } = require("../../controllers");
const { CustomerMiddleware } = require("../../middlewares");
const authenticate = require('../../middlewares/auth.middleware');
const CustomerRoutes = express.Router();

/**
 * /api/v1/auth/Customer   POST
 */
CustomerRoutes.post('/', CustomerMiddleware.validateBodyRequest, CustomerController.addCustomers);

/**
 * /api/v1/auth/Customer/:CustomerId   GET
 */
CustomerRoutes.get('/:customerId', CustomerMiddleware.validateGetRequest, CustomerController.getCustomer);

/**
 * /api/v1/auth/Customers/  GET
 */
CustomerRoutes.get('/', CustomerController.getAllCustomers);

module.exports = CustomerRoutes;