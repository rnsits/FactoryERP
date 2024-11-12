const {StatusCodes} = require('http-status-codes');
const {ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app.error');

function validateGetRequest(req,res,next){

    // Validate if productId is a valid integer
    const productId = req.params.productId;
    if (isNaN(productId) || parseInt(productId) <= 0) {
        ErrorResponse.message = "Something went wrong while getting product.";
        ErrorResponse.error = new AppError(["Invalid product ID. Must be a positive number."])
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(!productId){
        ErrorResponse.message = "Something went wrong while getting product.";
        ErrorResponse.error = new AppError(["Product Id not found on the incoming request."],StatusCodes.BAD_REQUEST)
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    next();
}

function validateBodyUpdate(req, res, next){
    const productId = req.params.productId;
    const quantity = req.body.quantity;
    if (isNaN(productId) || parseInt(productId) <= 0) {
        ErrorResponse.message = "Something went wrong while getting product.";
        ErrorResponse.error = new AppError(["Invalid product ID. Must be a positive number."]);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(!productId){
        ErrorResponse.message = "Something went wrong while getting product";
        ErrorResponse.error = new AppError(["Product Id not found on the incoming request"],StatusCodes.BAD_REQUEST);
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    if(isNaN(quantity) || parseInt(quantity) <=0){
        ErrorResponse.message = "Something went wrong while getting product.";
        ErrorResponse.error = new AppError(["Invalid quantity. Must be a positive number."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(req.body.transaction_type && (req.body.transaction_type !== "in" || req.body.transaction_type !== "out")) {
        ErrorResponse.message = "Something went wrong while updating product";
        ErrorResponse.error = new AppError(["Transaction Type must be 'in' or 'out'." ], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }
    next();
}

function validateReduce(req, res, next){
    const productId = req.params.productId;
    const quantity = req.body.quantity;
    if (isNaN(productId) || parseInt(productId) <= 0) {
        ErrorResponse.message = "Something went wrong while getting product.";
        ErrorResponse.error = new AppError(["Invalid product ID. Must be a positive number."]);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(!productId){
        ErrorResponse.message = "Something went wrong while getting product";
        ErrorResponse.error = new AppError(["Product Id not found on the incoming request"],StatusCodes.BAD_REQUEST);
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    if(isNaN(quantity) || parseInt(quantity) <=0){
        ErrorResponse.message = "Something went wrong while getting product.";
        ErrorResponse.error = new AppError(["Invalid quantity. Must be a positive number."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
}


function validateBodyRequest(req, res, next){

    const description_type = req.body.description_type;
    // Validate description_type to be either "audio" or "text"
    const validDescriptionTypes = ["audio", "text"];
    if (!validDescriptionTypes.includes(description_type)) {
        ErrorResponse.message ="Something went wrong while creating product.";
        ErrorResponse.error = new AppError(["Invalid description type. Allowed types are 'audio' and 'text'."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    // If description_type is "audio", ensure audio_path is provided
    if (description_type === "audio" && !req.body.audio_path) {
        ErrorResponse.message = "Something went wrong while creating product.";
        ErrorResponse.error = new AppError(["Audio path must be provided when description type is 'audio'."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    
    // desription is text need description
    if(description_type === "text" && !req.body.description) {
        ErrorResponse.message = "Somethiong went wrong while creating a product.";
        ErrorResponse.error = new AppError(["Description must be provided when type is 'text'."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    // Validate quantity_type to be one of the allowed values
    const validQuantityTypes = ["kg", "l", "m", "pcs"]; // Add more as needed
    if (!validQuantityTypes.includes(req.body.quantity_type)) {
        ErrorResponse.message = "Something went wrong while creating a product.";
        ErrorResponse.error = new AppError(["Invalid quantity type. Allowed types are 'kg', 'l', 'm', 'pcs'."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    // //Validate image path
    // if(!req.body.product_image) {
    //     ErrorResponse.message = "Image path missing.";
    //     return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    // }
    next();
};

function validatePutBodyRequest(req, res, next) {
    const {products} = req.body;
    if (!Array.isArray(products) || products.length === 0) {
        ErrorResponse.message = "Something went wrong while updating products.";
        ErrorResponse.error = new AppError(["Invalid products input"], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
      }
      for (const product of products) {
        if (!product.id || !product.quantity || !product.transaction_type) {
          ErrorResponse.message = "Something went wrong while updating products.";
          ErrorResponse.error = new AppError(["Invalid product data structure"], StatusCodes.BAD_REQUEST);
          return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }
        if (!['in', 'out'].includes(product.transaction_type)) {
          ErrorResponse.message = "Something went wrong while updating products.";
          ErrorResponse.error = new AppError(["Invalid transaction type"], StatusCodes.BAD_REQUEST);
          return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }
        if (product.quantity <= 0) {
          ErrorResponse.message = "Something went wrong while updating products.";
          ErrorResponse.error = new AppError(["Quantity must be greater than 0"], StatusCodes.BAD_REQUEST);
          return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }
      }

    next();
}

module.exports = {
    validateBodyRequest,
    validateGetRequest,
    validateBodyUpdate,
    validateReduce,
    validatePutBodyRequest
}