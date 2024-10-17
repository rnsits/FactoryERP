const express = require("express");
const { VendorController } = require("../../controllers");
const { VendorMiddleware } = require("../../middlewares");
const VendorRouter = express.Router();

/**
 * /api/v1/auth/Vendor   POST
 */
VendorRouter.post('/', VendorMiddleware.validateBodyRequest, VendorController.addVendor);

/**
 * /api/v1/auth/Vendor/:vendorId   GET
 */
VendorRouter.get('/:vendorId', VendorMiddleware.validateGetRequest, VendorController.getVendor);

/**
 * /api/v1/auth/Vendor/  GET
 */
VendorRouter.get('/', VendorController.getAllVendors);

module.exports = VendorRouter;