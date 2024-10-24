require('dotenv').config();
module.exports = {
  PORT: process.env.PORT,
  SALT_ROUNDS: process.env.SALT_ROUNDS,
  JWT_EXPIRY: process.env.JWT_EXPIRY,
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  DEV_DB_USERNAME: process.env.DEV_DB_USERNAME,
  DEV_DB_PASSWORD: process.env.DEV_DB_PASSWORD,
  DEV_DB_NAME: process.env.DEV_DB_NAME,
  DEV_DB_HOST: process.env.DEV_DB_HOST,
  PRODUCTION_USERNAME: process.env.PRODUCTION_USERNAME,
  PRODUCTION_PASSWORD: process.env.PRODUCTION_PASSWORD,
  PRODUCTION_DATABASE: process.env.PRODUCTION_DATABASE,
  PRODUCTION_HOST: process.env.PRODUCTION_HOST,
  PRODUCTION_PORT: process.env.PRODUCTION_PORT
}

