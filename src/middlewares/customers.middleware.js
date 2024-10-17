const {StatusCodes} = require('http-status-codes');
const {ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app.error');

function validateGetRequest(req,res,next){

    // Validate if productId is a valid integer
    const customerId = req.params.customerId;
    if (isNaN(customerId) || parseInt(customerId) <= 0) {
        ErrorResponse.message = "Something went wrong while getting customers.";
        ErrorResponse.error = new AppError(["Customer ID. Must be a positive number."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(!customerId){
        ErrorResponse.message = "Something went wrong while getting customers.";
        ErrorResponse.error = new AppError(["Customer Id not found on the incoming request"],StatusCodes.BAD_REQUEST);
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    next();
}

function validateBodyRequest(req, res, next) {
    
    if(!req.body.name){
        ErrorResponse.message = "Something went wrong while creating customers.";
        ErrorResponse.error = new AppError(["Name not found on the incoming request"],StatusCodes.BAD_REQUEST);
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    if(!req.body.address){
        ErrorResponse.message = "Something went wrong while creating customers.";
        ErrorResponse.error = new AppError(["Address not found on the incoming request"],StatusCodes.BAD_REQUEST);
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    if(!req.body.pincode){
        ErrorResponse.message = "Something went wrong while creating customers.";
        ErrorResponse.error = new AppError(["Pincode missing in the incoming request."], StatusCodes.BAD_REQUEST);
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    if(!req.body.mobile){
        ErrorResponse.message = "Something went wrong while creating customers.";
        ErrorResponse.error = new AppError(["Mobile missing in the incoming request."], StatusCodes.BAD_REQUEST);
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    next();
}


module.exports = {
    validateGetRequest,
    validateBodyRequest
}
