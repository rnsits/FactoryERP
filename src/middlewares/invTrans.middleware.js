const {StatusCodes} = require('http-status-codes');
const {ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app.error');


function validateBodyDate(req,res,next){

    // Validate if productId is a valid integer
    if(!req.body.date){
        ErrorResponse.message = "Something went wrong while getting invoice item";
        ErrorResponse.error = new AppError(["Date missintg in the incoming request"],StatusCodes.BAD_REQUEST)
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    next();
}

module.exports = {
    validateBodyDate
}