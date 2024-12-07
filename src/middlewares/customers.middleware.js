const {StatusCodes} = require('http-status-codes');
const {ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app.error');

function validateGetRequest(req,res,next){
    const customerId = req.params.customerId;
    // Validate if productId is a valid integer
    if(!customerId){
        ErrorResponse.message = "Something went wrong while getting customers.";
        ErrorResponse.error = new AppError(["Customer Id not found on the incoming request"],StatusCodes.BAD_REQUEST);
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    if (isNaN(customerId) || parseInt(customerId) <= 0) {
        ErrorResponse.message = "Something went wrong while getting customers.";
        ErrorResponse.error = new AppError(["Customer ID. Must be a positive number."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
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
    if(!req.body.customer_type) {
        ErrorResponse.message = "Something went wrong while creating customers.";
        ErrorResponse.error = new AppError(["Customer Type not found on the incoming request"],StatusCodes.BAD_REQUEST);
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    const validType = ['Company', 'Individual'];
    if(!validType.includes(req.body.customer_type)) {
        ErrorResponse.message = "Something went wrong while creating customers.";
        ErrorResponse.error = new AppError(["Customer Type should be either Company or Individual"],StatusCodes.BAD_REQUEST);
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
    if(req.body.pincode.length < 6 || req.body.pincode.length > 6){
        ErrorResponse.message = "Something went wrong while creating customers.";
        ErrorResponse.error = new AppError(["Pincode should be 6 digit."], StatusCodes.BAD_REQUEST);
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
    if(req.body.mobile.length < 10 || req.body.mobile.length >10) {
        ErrorResponse.message = "Something went wrong while creating customers.";
        ErrorResponse.error = new AppError(["Mobile number should be 10 digit."], StatusCodes.BAD_REQUEST);
        return res
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    next();
}

function validateCustomerSettings(req, res, next) {
    const { name, address, mobile, pincode, email, customer_type, gstin } = req.body;
    if(!req.params.id) {
        ErrorResponse.message = "Something went wrong while setting customers.";
        ErrorResponse.error = new AppError(["Customer Id Missing."], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }
    if(name && name.trim().length <4) {
        ErrorResponse.message = "Something went wrong while setting customers.";
        ErrorResponse.error = new AppError(["Name length must be atleast 4 characters.."], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }
    if(mobile && (mobile.trim().length != 10)) {
        ErrorResponse.message = "Something went wrong while setting customers.";
        ErrorResponse.error = new AppError(["Mobile must be 10 characters long."], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }
    if(pincode && (pincode.trim().length != 6)) {
        ErrorResponse.message = "Something went wrong while setting customers.";
        ErrorResponse.error = new AppError(["Pincode must be 6 characters long."], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }
    if (email && !/\S+@\S+\.\S+/.test(email)) {
        ErrorResponse.message = "Something went wrong while setting customers.";
        ErrorResponse.error = new AppError(["Invalid Email Format."], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }
    const validTypes = ['Individual', 'Company'];
    if (customer_type && !validTypes.includes(customer_type)) {
        ErrorResponse.message = "Something went wrong while setting customers.";
        ErrorResponse.error = new AppError(["Customer Type should be either 'Individual' or 'Company'."], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }

    // Validate gstin (if provided)
    if (gstin && (typeof gstin != 'string' || gstin.length != 15)) {
        ErrorResponse.message = "Something went wrong while setting customers.";
        ErrorResponse.error = new AppError(["GSTIN should be exactly 15 characters long."], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }
    next();
}


module.exports = {
    validateGetRequest,
    validateBodyRequest,
    validateCustomerSettings
}
