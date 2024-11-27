const express = require("express");
const { InvTransController } = require("../../controllers");
// const { ExpensesMiddleware } = require("../../middlewares");
const { authenticateToken } = require('../../middlewares/auth.middleware');
const { InventoryMiddleware } = require("../../middlewares");
const InvTransRoutes = express.Router();


/**
 * /api/v1/auth/inventory/  GET
 */
InvTransRoutes.get('/', authenticateToken, InvTransController.getAllInventoryTransactions);
InvTransRoutes.get('/getdamaged', authenticateToken, InvTransController.getDamagedProductsData);
InvTransRoutes.post('/getdamageddate', authenticateToken, InventoryMiddleware.validateBodyDate, InvTransController.getDamagedDataByDate);

module.exports = InvTransRoutes; 
