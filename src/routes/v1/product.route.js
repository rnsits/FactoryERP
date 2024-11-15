const express = require("express");
const { ProductController } = require("../../controllers");
const { ProductMiddleware } = require("../../middlewares");
const { authenticateToken } = require('../../middlewares/auth.middleware');
const ProductRouter = express.Router();

/**
 * /api/v1/auth/products   POST
 */
ProductRouter.post('/', authenticateToken, ProductMiddleware.validateBodyRequest,ProductController.addProduct);

ProductRouter.post('/damaged-products', authenticateToken, ProductMiddleware.validateDamagedProductRequest, ProductController.damagedProducts);

/**
 * /api/v1/auth/products/:Id   GET
 */
ProductRouter.get('/procount', authenticateToken, ProductController.getProductCount);
ProductRouter.get('/:productId', authenticateToken, ProductMiddleware.validateGetRequest,ProductController.getProduct);

ProductRouter.patch('/:productId/reduce', authenticateToken, ProductMiddleware.validateReduce, ProductController.reduceProduct);

ProductRouter.patch('/:productId/update', authenticateToken, ProductMiddleware.validateBodyUpdate, ProductController.updateProductByQuantity);

ProductRouter.put('/valupdate', authenticateToken, ProductMiddleware.validatePutBodyRequest, ProductController.validateAndUpdateProducts);



/**
 * /api/v1/auth/products/  GET
 */
ProductRouter.get('/', authenticateToken, ProductController.getProducts);

module.exports = ProductRouter;