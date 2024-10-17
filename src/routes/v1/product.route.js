const express = require("express");
const { ProductController } = require("../../controllers");
const { ProductMiddleware } = require("../../middlewares");
const ProductRouter = express.Router();

/**
 * /api/v1/auth/Product   POST
 */
ProductRouter.post('/', ProductMiddleware.validateBodyRequest,ProductController.addProduct);

/**
 * /api/v1/auth/Product/:Id   GET
 */
ProductRouter.get('/:productId', ProductMiddleware.validateGetRequest,ProductController.getProduct);

/**
 * /api/v1/auth/Products/  GET
 */
ProductRouter.get('/', ProductController.getProducts);

module.exports = ProductRouter;