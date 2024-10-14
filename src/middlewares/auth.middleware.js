//middlewares
const { StatusCodes } = require("http-status-codes");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const AppError = require("../utils/errors/app.error");
const serverConfig = require("../config");

// const authenticate = async (req, res, next) => {
//     if (!req.session.user) {
//       return res.status(StatusCodes.UNAUTHORIZED).send(ErrorResponse.error);
//     }
//     next();
//   };
  
//   module.exports = authenticate;



  // middleware/auth.js
const jwt = require('jsonwebtoken');
const { verifyToken } = require("../utils/common/auth");

const authenticate = async (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    // return res.status(401).send({ error: 'Unauthorized' });
    return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "No token provided"
    });
  }

  console.log("token test autheticate", token);
  try {
    // const payload = jwt.verify(token, process.env.SECRET_KEY);
    const tokenValue = token.split(" ")[1];
    const payload = await verifyToken(token, serverConfig.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'Invalid or expired token',
        error: error.message
    });
  }
};

module.exports = authenticate;