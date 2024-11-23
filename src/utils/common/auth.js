// utils/auth.js
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const serverConfig = require('../../config/server.config');

async function generateToken(user) {
    try{
        const payload = {
            id: user.id,
            username: user.username,
        };
        const token = jwt.sign(payload, serverConfig.JWT_SECRET, {
            expiresIn: serverConfig.JWT_EXPIRY,
        });
        return token;
    } catch(error) {
        throw error;
    }
};

async  function generateRefreshToken(user) {
    try {
        const payload = {
            id: user.id,
            username: user.username
        }
        const refreshToken = jwt.sign(payload, serverConfig.JWT_REFRESH_SECRET, {
            expiresIn: serverConfig.JWT_REFRESH_EXPIRY,
        });
        const refreshTokenExpiry = new Date();
        // refreshTokenExpiry.setSeconds(refreshTokenExpiry.getSeconds() + serverConfig.JWT_REFRESH_EXPIRY);
        refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // Set expiry for 7 days from now
        
        return { refreshToken, refreshTokenExpiry };
    } catch (error) {
        throw error;
    }
}

async function checkPassword(plainPassword, encryptedPassword) {
  try {
    return await bcrypt.compare(plainPassword, encryptedPassword);
  } catch (error) {
    console.error('Password check error: ', error.message);
    return false;
  }
}

async function verifyToken(token) {
  try {
     const data =  jwt.verify(token, serverConfig.JWT_SECRET);
     return data;
  } catch(error) {
      throw error;
  }
}



module.exports = { 
    generateToken,
    generateRefreshToken,
    checkPassword,
    verifyToken
};