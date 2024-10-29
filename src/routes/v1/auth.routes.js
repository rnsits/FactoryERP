// routes/auth.js
const express = require('express');
// const authController = require('../controllers/auth.controller');
const { AuthController } = require('../../controllers');
const { authenticateToken } = require('../../middlewares/auth.middleware');
const AuthRouter = express.Router();

// Route for login with username and password
AuthRouter.post('/login/password', AuthController.loginWithPassword);

// Route for login with PIN
AuthRouter.post('/login/pin', AuthController.loginWithPin);

// Route for logout
AuthRouter.post('/logout', AuthController.logout);

//Route to test user
AuthRouter.get('/test', authenticateToken, (req, res) => {
    res.json({ message: "Testing access", user: req.user });
});

module.exports = AuthRouter;
