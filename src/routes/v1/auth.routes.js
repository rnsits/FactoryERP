// routes/auth.js
const express = require('express');
// const authController = require('../controllers/auth.controller');
const { AuthController } = require('../../controllers');
const authenticate = require('../../middlewares/auth.middleware');
const AuthRouter = express.Router();

// Route for login with username and password
AuthRouter.post('/login/password', AuthController.loginWithPassword);

// Route for login with PIN
AuthRouter.post('/login/pin', AuthController.loginWithPin);

// Route for logout
AuthRouter.post('/logout', AuthController.logout);

// test route for authenticated values
// AuthRouter.get('/protected', authenticate, (req, res)=> {
//     res.status(200).json({message: "In the protected route", user: req.user});
// })

module.exports = AuthRouter;
