const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { VendorsRepository } = require("../repositories");
const { Vendors } = require("../models");
const { Op } = require("sequelize");

const vendorRepository = new VendorsRepository();

async function createVendor(data) {
    try{
        const vendor = await vendorRepository.create(data);
        return vendor;
      }catch(error){
        console.log(error);
      if (
        error.name == "SequelizeValidationError" ||
        error.name == "SequelizeUniqueConstraintError"
      ) {
        let explanation = [];
        error.errors.forEach((err) => {
          explanation.push(err.message);
        });
        throw new AppError(explanation, StatusCodes.BAD_REQUEST);
      }
      throw new AppError(
        "Cannot create a new Vendor.",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
}

async function getVendor(data) {
    try {
        const vendor = await vendorRepository.get(data);
        return vendor;
    } catch(error) {
        console.log(error);
        if(
            error.name == "SequelizeValidationError" ||
            error.name == "SequelizeUniqueConstraintError"
        ) {
          let explanation = [];
          error.errors.forEach((err) => {
            explanation.push(err.message);
          });
          throw new AppError(explanation, StatusCodes.BAD_REQUEST);
        } else if (
          error.name === "SequelizeDatabaseError" &&
          error.original &&
          error.original.routine === "enum_in"
        ) {
          throw new AppError(
            "Invalid value for associate_with field.",
            StatusCodes.BAD_REQUEST
          );
        }
        throw new AppError(
          "Cannot get Vendor.",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function getAllVendors(limit, offset, search, fields) {
    try {
        // const users = await vendorRepository.getAll();
        // return users;

        const where = {};
        
        if (search && fields.length > 0) {
            where[Op.or] = fields.map(field => ({
                [field]: { [Op.like]: `%${search}%` }
            }));
        }
        const { count, rows } = await Vendors.findAndCountAll({
          where,
          limit,
          offset,
        });
      return { count, rows };
    } catch(error) {
        console.log(error);
        if(
            error.name == "SequelizeValidationError" ||
            error.name == "SequelizeUniqueConstraintError"
        ) {
          let explanation = [];
          error.errors.forEach((err) => {
            explanation.push(err.message);
          });
          throw new AppError(explanation, StatusCodes.BAD_REQUEST);
        } else if (
          error.name === "SequelizeDatabaseError" &&
          error.original &&
          error.original.routine === "enum_in"
        ) {
          throw new AppError(
            "Invalid value for associate_with field.",
            StatusCodes.BAD_REQUEST
          );
        }
        throw new AppError(
          "Cannot get Vendor Object",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

module.exports = {
    createVendor,
    getVendor,
    getAllVendors
}