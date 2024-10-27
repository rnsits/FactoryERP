const express = require("express");
const { InvTransController } = require("../../controllers");
// const { ExpensesMiddleware } = require("../../middlewares");
const authenticate = require('../../middlewares/auth.middleware');
const InvTransRoutes = express.Router();


/**
 * /api/v1/auth/expenses/  GET
 */
InvTransRoutes.get('/', InvTransController.getAllInventoryTransactions);


module.exports = InvTransRoutes; 
