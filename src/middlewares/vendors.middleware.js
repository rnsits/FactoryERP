const {StatusCodes} = require('http-status-codes');
const {ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app.error');


function validateGetRequest(req,res,next){

    // Validate if productId is a valid integer
    const vendorId = req.params.vendorId;
    if(!vendorId){
        ErrorResponse.message = "Something went wrong while getting vendor.";
        ErrorResponse.error = new AppError(["Vendor Id Missing."],StatusCodes.BAD_REQUEST)
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    if (isNaN(vendorId) || parseInt(vendorId) <= 0) {
        ErrorResponse.message = "Invalid vendor ID. Must be a positive number.";
        ErrorResponse.error = new AppError(["Vendor Id must be positive."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
}

function validateBodyRequest(req, res, next){
    
    // Validate the body name, address, contact_person,mobile,pincode, email
    if (!req.body.name) {
        ErrorResponse.message = "Something went wrong.";
        ErrorResponse.error = new AppError(["Name not found on the incoming request"],
        StatusCodes.BAD_REQUEST);
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    
    if (!req.body.address) {
        ErrorResponse.message = "Something went wrong.";
        ErrorResponse.error = new AppError(["Address Missing."], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }   
    if (!req.body.contact_person) {
        ErrorResponse.message = "Something went wrong.";
        ErrorResponse.error = new AppError(["Contact Person Missing."], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }  
    if (!req.body.pincode) {
        ErrorResponse.message = "Something went wrong.";
        ErrorResponse.error = new AppError(["Pincode Missing"], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }  
    if(req.body.pincode.length > 6 || req.body.length > 6) {
        ErrorResponse.message = "Something went wrong.";
        ErrorResponse.error = new AppError(["Pincode must be atleast 6 digits"], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    if (!req.body.mobile) {
        ErrorResponse.message = "Something went wrong.";
        ErrorResponse.error = new AppError(["Mobile Missing."], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    } 
    if (req.body.mobile.length < 10 || req.body.mobile.length > 10) {
        ErrorResponse.message = "Something went wrong.";
        ErrorResponse.error = new AppError(["Mobile must be atleast 10 digit."], StatusCodes.BAD_REQUEST);
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