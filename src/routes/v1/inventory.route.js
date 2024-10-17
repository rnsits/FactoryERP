const express = require("express");
const { InventoryController } = require("../../controllers");
const { InventoryMiddleware } = require("../../middlewares");
const InventoryRoutes = express.Router();

/**
 * /api/v1/auth/Inventory   POST
 */
InventoryRoutes.post('/', InventoryMiddleware.validateBodyRequest, InventoryController.addInventory);

/**
 * /api/v1/auth/Inventory/:InventoryId   GET
 */
InventoryRoutes.get('/:inventoryId', InventoryMiddleware.validateGetRequest, InventoryController.getInventory);

/**
 * /api/v1/auth/Inventories/  GET
 */
InventoryRoutes.get('/', InventoryController.getAllInventories);

module.exports = InventoryRoutes;