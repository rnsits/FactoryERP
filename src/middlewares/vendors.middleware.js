const {StatusCodes} = require('http-status-codes');
const {ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app.error');


function validateGetRequest(req,res,next){

    // Validate if productId is a valid integer
    const vendorId = req.params.vendorId;
    if (isNaN(vendorId) || parseInt(vendorId) <= 0) {
        ErrorResponse.message = "Invalid vendor ID. Must be a positive number.";
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(!vendorId){
        ErrorResponse.message = "Something went wrong while getting vendor.";
        ErrorResponse.error = new AppError(["Vendor Id not found on the incoming request"],StatusCodes.BAD_REQUEST)
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    next();
}

function validateBodyRequest(req, res, next){
    
    // Validate the body name, address, contact_person,mobile,pincode, email
    if (!req.body.name) {
        ErrorResponse.message = "Something went wrong.";
        ErrorResponse.error = new AppError(["Name not found on the incoming request"],
        StatusCodes.BAD_REQUEST)
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    
    if (!req.body.address) {
        ErrorResponse.mesaage = "Something went wrong.";
        ErrorResponse.error = new AppError(["Address not found in the incoming request"])
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }   
    if (!req.body.contact_person) {
        ErrorResponse.mesaage = "Something went wrong.";
        ErrorResponse.error = new AppError(["Contact Person not found in the incoming request"])
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }  
    if (!req.body.pincode) {
        ErrorResponse.mesaage = "Something went wrong.";
        ErrorResponse.error = new AppError(["Pincode not found in the incoming request"])
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }  
    if (!req.body.mobile) {
        ErrorResponse.mesaage = "Something went wrong.";
        ErrorResponse.error = new AppError(["Mobile not found in the incoming request"])
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    } 
    next();
};

module.exports = {
    validateBodyRequest,
    validateGetRequest
}