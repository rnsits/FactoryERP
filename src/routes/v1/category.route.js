const express = require("express");
const { CategoryController } = require("../../controllers");
const { CategoryMiddleware } = require("../../middlewares");
const { authenticateToken } = require('../../middlewares/auth.middleware');
const CategoryRouter = express.Router();

/**
 * /api/v1/auth/Category   POST
 */
CategoryRouter.post('/', authenticateToken, CategoryMiddleware.validateBodyRequest, CategoryController.addCategory);

/**
 * /api/v1/auth/Category/:categoryId   GET
 */
CategoryRouter.get('/:categoryId', authenticateToken, CategoryMiddleware.validateGetRequest, CategoryController.getCategory);

/**
 * /api/v1/auth/Categories/  GET
 */
CategoryRouter.get('/', authenticateToken, CategoryController.getAllCategories);

module.exports = CategoryRouter;