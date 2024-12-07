const express = require("express");
const { UserController } = require("../../controllers");
const { UserMiddleware } = require("../../middlewares");
const UserRouter = express.Router();
const { authenticateToken } = require('../../middlewares/auth.middleware');
const { multerMiddleware, imageUpload } = require('../../config/multer.config');

/**
 * /api/v1/auth/User   POST
 */
UserRouter.post('/', authenticateToken, multerMiddleware(imageUpload('logo')), UserMiddleware.validateBodyRequest, UserController.addUser);

/**
 * /api/v1/auth/User/:UserId   GET
 */
UserRouter.get('/:userId', authenticateToken, UserMiddleware.validateGetRequest, UserController.getUser);

UserRouter.patch('/:userId/bal', authenticateToken, UserMiddleware.validatePatchBody, UserController.updateUserBalance);

UserRouter.patch('/userset/:id', authenticateToken, UserController.userSettings);

UserRouter.patch('/uslogo', authenticateToken, multerMiddleware(imageUpload('logo')), UserController.updateLogo);

/**
 * /api/v1/auth/Users/  GET
 */
UserRouter.get('/', authenticateToken, UserController.getAllUsers);

module.exports = UserRouter;