const express = require("express");
const { InvTransController } = require("../../controllers");
// const { ExpensesMiddleware } = require("../../middlewares");
const { authenticateToken } = require('../../middlewares/auth.middleware');
const InvTransRoutes = express.Router();


/**
 * /api/v1/auth/inventory/  GET
 */
InvTransRoutes.get('/', authenticateToken, InvTransController.getAllInventoryTransactions);


module.exports = InvTransRoutes; 
