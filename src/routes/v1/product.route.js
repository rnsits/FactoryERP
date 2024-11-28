const express = require("express");
const { ProductController } = require("../../controllers");
const { ProductMiddleware } = require("../../middlewares");
const { authenticateToken } = require('../../middlewares/auth.middleware');
// const upload = require("../../config/multer.config");
const {imageUpload, multerMiddleware, audioUpload} = require("../../config/multer.config");

const ProductRouter = express.Router();

/**
 * /api/v1/auth/products   POST
 */
ProductRouter.post('/', authenticateToken, multerMiddleware(imageUpload('product_image')), ProductMiddleware.validateFormData, ProductController.addProduct);    

// ProductRouter.post('/damaged-products', authenticateToken,upload.single('audio_path'), ProductController.damagedProducts);
ProductRouter.post('/damaged-products', authenticateToken, multerMiddleware(audioUpload('audio_path')), ProductMiddleware.validateDamagedProductRequest, ProductController.damagedProducts);

// ProductRouter.post('/mfcpro', authenticateToken,upload.single('product_image'), ProductController.createManufacturedProduct);
ProductRouter.post('/mfcpro', authenticateToken, multerMiddleware(imageUpload('product_image')), ProductMiddleware.validateMfcData, ProductController.createManufacturedProduct);

/**
 * /api/v1/auth/products/:Id   GET
 */
ProductRouter.get('/procount', authenticateToken, ProductController.getProductCount);
ProductRouter.get('/:productId', authenticateToken, ProductMiddleware.validateGetRequest,ProductController.getProduct);

ProductRouter.patch('/:productId/reduce', authenticateToken, ProductMiddleware.validateReduce, ProductController.reduceProduct);

ProductRouter.patch('/:productId/update', authenticateToken, ProductMiddleware.validateBodyUpdate, ProductController.updateProductByQuantity);

ProductRouter.patch('/upProImg', authenticateToken, multerMiddleware(imageUpload('product_image')), ProductMiddleware.updateImage, ProductController.updateImage);

ProductRouter.put('/valupdate', authenticateToken, ProductMiddleware.validatePutBodyRequest, ProductController.validateAndUpdateProducts);



/**
 * /api/v1/auth/products/  GET
 */
ProductRouter.get('/', authenticateToken, ProductController.getProducts);

module.exports = ProductRouter;