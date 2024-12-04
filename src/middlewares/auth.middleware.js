//middlewares
const { StatusCodes } = require("http-status-codes");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const serverConfig = require("../config");

  // middleware/auth.js
const jwt = require('jsonwebtoken');
const { verifyToken } = require("../utils/common/auth");

const authenticateToken = async (req, res, next) => {

  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "No token provided"
    });
  }

  try {
    // const payload = jwt.verify(token, process.env.SECRET_KEY);
    const tokenValue = token.split(" ")[1];
    const payload = await verifyToken(token, serverConfig.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    console.log(error);
    ErrorResponse.message = 'Invalid or expired token'
    ErrorResponse.error = error;
    return res.status(StatusCodes.UNAUTHORIZED).json({ErrorResponse});
  }
};

module.exports = {
    authenticateToken
};