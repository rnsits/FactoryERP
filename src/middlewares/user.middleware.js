const {StatusCodes} = require('http-status-codes');
const {ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app.error');


function validateGetRequest(req,res,next){

    // Validate if productId is a valid integer
    const userId = req.params.userId;
    if (isNaN(userId) || parseInt(userId) <= 0) {
        ErrorResponse.message = "Something went wrong while getting user.";
        ErrorResponse.error = new AppError(["User Id must be a positive number"], StatusCodes.BAD_REQUEST)
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(!userId){
        ErrorResponse.message = "Something went wrong while getting user.";
        ErrorResponse.error = new AppError(["User Id not found on the incoming request"],StatusCodes.BAD_REQUEST)
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    next();
}

function validateBodyRequest(req, res, next){
    
    // Validate the body
    if (req.body.auth_method === 'username_password' && !req.body.password) {
        ErrorResponse.message = "Something went wrong while creating User.";
        ErrorResponse.error = new AppError(["Password required"], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse= "Password required");
    } else if (req.body.auth_method === 'pin' && !req.body.pin) {
        ErrorResponse.message = "Something went wrong while creating User.";
        ErrorResponse.error = new AppError(["Pin required"], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse.message = "Pin Required");
    }   
    next();
};

function validatePatchBody(req, res, next) {
    const userId = req.params.userId;
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
    next();
}

module.exports = {
    validateBodyRequest,
    validateGetRequest,
    validatePatchBody
}



