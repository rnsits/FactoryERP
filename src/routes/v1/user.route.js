const express = require("express");
const { UserController } = require("../../controllers");
const { UserMiddleware } = require("../../middlewares");
const UserRouter = express.Router();
const { authenticateToken } = require('../../middlewares/auth.middleware');

/**
 * /api/v1/auth/User   POST
 */
UserRouter.post('/', authenticateToken, UserMiddleware.validateBodyRequest, UserController.addUser);

/**
 * /api/v1/auth/User/:UserId   GET
 */
UserRouter.get('/:userId', authenticateToken, UserMiddleware.validateGetRequest, UserController.getUser);

UserRouter.patch('/:userId/bal', authenticateToken, UserMiddleware.validatePatchBody, UserController.updateUserBalance);

/**
 * /api/v1/auth/Users/  GET
 */
UserRouter.get('/', authenticateToken, UserController.getAllUsers);

module.exports = UserRouter;