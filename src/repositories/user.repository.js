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

    async updateUserBalance(user_id, amount) {
      const user = await User.findByPk(user_id);
      user.current_balance = user.current_balance + amount;
      await user.save();
      return user;
    } 

}


module.exports = UserRepository;