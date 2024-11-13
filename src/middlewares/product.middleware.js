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
   
    // Validate quantity_type to be one of the allowed values
    const validQuantityTypes = ["kg", "l", "m", "pcs"]; // Add more as needed
    if (!validQuantityTypes.includes(req.body.quantity_type)) {
        ErrorResponse.message = "Something went wrong while creating a product.";
        ErrorResponse.error = new AppError(["Invalid quantity type. Allowed types are 'kg', 'l', 'm', 'pcs'."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

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