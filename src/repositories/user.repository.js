const CrudRepository = require("./crud.repository");
const { User, sequelize } = require("../models");
const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { QueryTypes } = require("sequelize");
const axios = require('axios');
const { query } = require("express");

class UserRepository extends CrudRepository {
    constructor() {
      super(User);
    }

    async create(userData) {
        return await User.create(userData);
    }
    
    async findAll() {
        return await User.findAll();
    }

    async findById(id) {
        return await User.findByPk(id);
    }

    async update(id, userData) {
        const user = await this.findById(id);
        if (user) {
            return await user.update(userData);
        }
        return null;
    }

    async delete(id) {
        const user = await this.findById(id);
        if (user) {
            return await user.destroy();
        }
        return null;
    }
    

}


module.exports = UserRepository;