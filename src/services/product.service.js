const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { ProductRepository } = require("../repositories");
const { SuccessResponse } = require("../utils/common");

const productRepository = new ProductRepository();


async function createProduct(data) {
    try{
        const product = await productRepository.create(data);
        return product;
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
        "Cannot create a new Product",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
}

async function getProduct(data) {
    try {
        const product = await productRepository.get(data);
        return product;
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
          "Cannot get Product associate with the field",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function getAllProducts() {
    try {
        const products = await productRepository.getAll();
        return products;
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
          "Cannot get Product ",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function updateProduct(productId, newStock) {
  try {
    const product = await productRepository.update(productId, {
      stock:newStock
    });
    return product;
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
      "Cannot get Product ",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function reduceProductByQuantity(productId, stockData) {
  try {
    const product = await productRepository.update(productId, {
      stock:stockData
    });  
    return product;
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
      "Cannot update Product ",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
} 

async function getProductByNameAndCategory(name, category_id) {
 try {
  const product = await productRepository.getOne({
    where: {
      name, 
      category_id 
    }
  })
  return product || null;
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
    "Failed to retrieve product.",
    StatusCodes.INTERNAL_SERVER_ERROR
  );
 }
}

async function getProductCount(){
  try {
    const products = await productRepository.getAll();
    return products.length;
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Failed to retrieve product count.",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}



module.exports = {
    createProduct,
    getProduct,
    getAllProducts,
    updateProduct,
    reduceProductByQuantity,
    getProductByNameAndCategory,
    getProductCount
}