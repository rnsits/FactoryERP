const CrudRepository = require("./crud.repository");
const { User, sequelize } = require("../models");
const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { QueryTypes } = require("sequelize");
const { query } = require("express");

class UserRepository extends CrudRepository {
    constructor() {
      super(User);
    }
    

}


module.exports = UserRepository;