const express = require("express");
const { CategoryController } = require("../../controllers");
const { CategoryMiddleware } = require("../../middlewares");
const CategoryRouter = express.Router();

/**
 * /api/v1/auth/Category   POST
 */
CategoryRouter.post('/', CategoryMiddleware.validateBodyRequest, CategoryController.addCategory);

/**
 * /api/v1/auth/Category/:categoryId   GET
 */
CategoryRouter.get('/:categoryId', CategoryMiddleware.validateGetRequest, CategoryController.getCategory);

/**
 * /api/v1/auth/Categories/  GET
 */
CategoryRouter.get('/', CategoryController.getAllCategories);

module.exports = CategoryRouter;