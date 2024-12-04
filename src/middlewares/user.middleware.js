const {StatusCodes} = require('http-status-codes');
const {ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app.error');


function validateGetRequest(req,res,next){

    // Validate if productId is a valid integer
    const userId = req.params.userId;
    if(!userId){
        ErrorResponse.message = "Something went wrong while getting user.";
        ErrorResponse.error = new AppError(["User Id not found on the incoming request"],StatusCodes.BAD_REQUEST)
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    if (isNaN(userId) || parseInt(userId) <= 0) {
        ErrorResponse.message = "Something went wrong while getting user.";
        ErrorResponse.error = new AppError(["User Id must be a positive number"], StatusCodes.BAD_REQUEST)
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
}

function validateBodyRequest(req, res, next){
    const auth_method = req.body.auth_method;
    // Validate the auth method
    if (auth_method == 'username_password') {
        if(!req.body.password) {
            ErrorResponse.message = "Something went wrong while creating User.";
            ErrorResponse.error = new AppError(["Password required"], StatusCodes.BAD_REQUEST);
            return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
        } else if(req.body.password.trim().length < 8){
            ErrorResponse.message = "Something went wrong while creating User.";
            ErrorResponse.error = new AppError(["Password must be atleast 8 characters."], StatusCodes.BAD_REQUEST);
            return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        } 
    } else if (auth_method == 'pin') {
        if(!req.body.pin) {
            ErrorResponse.message = "Something went wrong while creating User.";
            ErrorResponse.error = new AppError(["Pin required"], StatusCodes.BAD_REQUEST);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        } else if(!/^\d{6}$/.test(req.body.pin) && isNaN(req.body.pin)) {
            ErrorResponse.message = "Something went wrong while creating User.";
            ErrorResponse.error = new AppError(["Pin must be 6 character long"], StatusCodes.BAD_REQUEST);
            return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }

    }   
    next();
};

function validatePatchBody(req, res, next) {
    const userId = req.params.userId;
    if(!userId) {
        ErrorResponse.message = "Something went wrong while updating User";
        ErrorResponse.error = new AppError(["User Id Missing."], StatusCodes.BAD_REQUEST)
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(isNaN(userId) || parseInt(userId) <= 0){
        ErrorResponse.message = "Something went wrong while updating User";
        ErrorResponse.error = new AppError(["User Id must be a positive number"], StatusCodes.BAD_REQUEST)
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(!req.body.amount){
        ErrorResponse.message = "Something went wrong while updating User";
        ErrorResponse.error = new AppError(["Amount is required"], StatusCodes.BAD_REQUEST)
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(isNaN(req.body.amount) || parseInt(req.body.amount) <= 0) {
        ErrorResponse.message = "Something went wrong while updating User";
        ErrorResponse.error = new AppError(["Amount must be a positive number"], StatusCodes.BAD_REQUEST)
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
}

module.exports = {
    validateBodyRequest,
    validateGetRequest,
    validatePatchBody
}



