const express = require("express");
const { ProductController } = require("../../controllers");
const { ProductMiddleware } = require("../../middlewares");
const authenticate = require('../../middlewares/auth.middleware');
const ProductRouter = express.Router();

/**
 * /api/v1/auth/products   POST
 */
ProductRouter.post('/', ProductMiddleware.validateBodyRequest,ProductController.addProduct);

/**
 * /api/v1/auth/products/:Id   GET
 */
ProductRouter.get('/procount', ProductController.getProductCount);
ProductRouter.get('/:productId', ProductMiddleware.validateGetRequest,ProductController.getProduct);

ProductRouter.patch('/:productId/reduce', ProductMiddleware.validateReduce, ProductController.reduceProduct);

ProductRouter.patch('/:productId/update', ProductMiddleware.validateBodyUpdate, ProductController.updateProductByQuantity);

ProductRouter.put('/valupdate', ProductMiddleware.validatePutBodyRequest, ProductController.validateAndUpdateProducts);



/**
 * /api/v1/auth/products/  GET
 */
ProductRouter.get('/', ProductController.getProducts);

module.exports = ProductRouter;