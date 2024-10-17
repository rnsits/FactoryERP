const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { UserRepository } = require("../repositories");

const userRepository = new UserRepository();

async function createUser(data) {
    try{
        const user = await userRepository.create(data);
        return user;
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
        "Cannot create a new User",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
}

async function getUser(data) {
    try {
        const user = await userRepository.get(data);
        return user;
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
          "Cannot get User for associated value.",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function getAllUser() {
    try {
        const users = await userRepository.getAll();
        return users;
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
          "Cannot get user.",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

module.exports = {
    createUser,
    getUser,
    getAllUser
}