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

ProductRouter.patch('/:productId/reduce', ProductMiddleware.validateReduce, ProductController.reduceProduct);

ProductRouter.patch('/:productId/update', ProductMiddleware.validateBodyUpdate, ProductController.updateProductByQuantity);



/**
 * /api/v1/auth/Products/  GET
 */
ProductRouter.get('/', ProductController.getProducts);

module.exports = ProductRouter;