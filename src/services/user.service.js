const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { UserRepository } = require("../repositories");
const { User } = require("../models");

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

async function updateUserBalance(userId, amount){
  try {
    const user = await userRepository.update(userId, {
      current_balance:amount
    });  
  } catch (error) {
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
          "Cannot update user.",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
  }
}

async function updateUser(id, updateData) {
  try{
    const user = await User.findByPk(id);
    return await user.update(updateData);
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
      "Cannot update user",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
}
}

async function updateLogo(id, logo) {
  try {
    const response = await userRepository.update(id, {logo});
    return response;
  } catch (error) {
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
      "Cannot update user logo.",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

module.exports = {
    createUser,
    getUser,
    getAllUser,
    updateUserBalance,
    updateUser,
    updateLogo
}