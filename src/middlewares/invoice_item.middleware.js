const {StatusCodes} = require('http-status-codes');
const {ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app.error');

function validateGetRequest(req,res,next){

    // Validate if productId is a valid integer
    const invoiceItemId = req.params.invoiceItemId;
    if (isNaN(invoiceItemId) || parseInt(invoiceItemId) <= 0) {
        ErrorResponse.message = "Invalid invoice item ID. Must be a positive number.";
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(!invoiceItemId){
        ErrorResponse.message = "Something went wrong while getting invoice item";
        ErrorResponse.error = new AppError(["Invoice Item Id not found on the incoming request"],StatusCodes.BAD_REQUEST)
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    next();
}

function validateBodyRequest(req, res, next){

    // Validate product id to be either "audio" or "text"
    if(!req.body.product_id){
        ErrorResponse.message = "Something went wrong while getting invoice item";
        ErrorResponse.error = new AppError(["Product Id not found on the incoming request"],StatusCodes.BAD_REQUEST)
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }

    if(!req.body.quantity){
        ErrorResponse.message = "Something went wrong while getting Invoice Item";
        ErrorResponse.error = new AppError(["Quantity not found on the incoming request"],StatusCodes.BAD_REQUEST)
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }

    // Validate quantity_type to be one of the allowed values
    const validQuantityTypes = ["kg", "l", "m", "pcs"]; // Add more as needed
    if (!validQuantityTypes.includes(req.body.quantity_type)) {
        ErrorResponse.message = "Invalid quantity type. Allowed types are 'kg', 'l', 'm', 'pcs'.";
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if(!req.body.unit_price){
        ErrorResponse.message = "Something went wrong while getting invoice item";
        ErrorResponse.error = new AppError(["Unit Price not found on the incoming request"],StatusCodes.BAD_REQUEST)
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }

    next();
};

module.exports = {
    validateBodyRequest,
    validateGetRequest
}