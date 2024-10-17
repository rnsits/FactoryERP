const express = require("express");
const { UserController } = require("../../controllers");
const { UserMiddleware } = require("../../middlewares");
const UserRouter = express.Router();

/**
 * /api/v1/auth/User   POST
 */
UserRouter.post('/', UserMiddleware.validateBodyRequest, UserController.addUser);

/**
 * /api/v1/auth/User/:UserId   GET
 */
UserRouter.get('/:userId', UserMiddleware.validateGetRequest, UserController.getUser);

/**
 * /api/v1/auth/Users/  GET
 */
UserRouter.get('/', UserController.getAllUsers);

module.exports = UserRouter;