const express = require("express");
const { VendorController } = require("../../controllers");
const { VendorMiddleware } = require("../../middlewares");
const VendorRouter = express.Router();
const { authenticateToken } = require('../../middlewares/auth.middleware');

/**
 * /api/v1/auth/Vendor   POST
 */
VendorRouter.post('/', authenticateToken, VendorMiddleware.validateBodyRequest, VendorController.addVendor);

/**
 * /api/v1/auth/Vendor/:vendorId   GET
 */
VendorRouter.get('/:vendorId', authenticateToken, VendorMiddleware.validateGetRequest, VendorController.getVendor);

/**
 * /api/v1/auth/Vendor/  GET
 */
VendorRouter.get('/', authenticateToken, VendorController.getAllVendors);

module.exports = VendorRouter;