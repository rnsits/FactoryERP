const express = require("express");
const { UserController } = require("../../controllers");
const { UserMiddleware } = require("../../middlewares");
const UserRouter = express.Router();
const authenticate = require('../../middlewares/auth.middleware');

/**
 * /api/v1/auth/User   POST
 */
UserRouter.post('/', UserMiddleware.validateBodyRequest, UserController.addUser);

/**
 * /api/v1/auth/User/:UserId   GET
 */
UserRouter.get('/:userId', UserMiddleware.validateGetRequest, UserController.getUser);

UserRouter.patch('/:userId/bal', UserMiddleware.validatePatchBody, UserController.updateUserBalance);

/**
 * /api/v1/auth/Users/  GET
 */
UserRouter.get('/', UserController.getAllUsers);

module.exports = UserRouter;