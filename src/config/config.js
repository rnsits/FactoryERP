require('dotenv').config();

const data = {
  development: {
    username: process.env.DEV_DB_USERNAME || 'root',
    password: process.env.DEV_DB_PASSWORD || 'Kleio321@',
    database: process.env.DEV_DB_NAME || "FactoryERP",
    host: process.env.DEV_DB_HOST || '127.0.0.1',
    dialect: "mysql",
    pool: {
      max: 10,        // Maximum number of connections in the pool
      min: 0,         // Minimum number of connections in the pool
      acquire: 30000, // Maximum time (ms) to wait for a connection
      idle: 10000     // Time (ms) a connection can be idle before being released
    }
  },
  test: {
    username: process.env.TEST_DB_USERNAME || 'root',
    password: process.env.TEST_DB_PASSWORD || null,
    database: process.env.TEST_DB_NAME || 'database_test',
    host: process.env.TEST_DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,        // Maximum number of connections in the pool
      min: 0,         // Minimum number of connections in the pool
      acquire: 30000, // Maximum time (ms) to wait for a connection
      idle: 10000     // Time (ms) a connection can be idle before being released
    }
  },
  production: { 
    // remember to uncomment when pusshing migration
    // "url":"mysql://factory:g6kehndcf8GEUwqsv5FrN@98.70.13.173:3004/FactoryERP",
    username: process.env.PRODUCTION_USERNAME,
    password: process.env.PRODUCTION_PASSWORD,
    database: process.env.PRODUCTION_DATABASE,
    host: process.env.PRODUCTION_HOST,
    port: process.env.PRODUCTION_PORT,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,        // Maximum number of connections in the pool
      min: 0,         // Minimum number of connections in the pool
      acquire: 30000, // Maximum time (ms) to wait for a connection
      idle: 10000     // Time (ms) a connection can be idle before being released
   }
  }
}

module.exports = data;

