const {StatusCodes} = require('http-status-codes');
const {ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app.error');


function validateGetRequest(req,res,next){

    // Validate if productId is a valid integer
    const userId = req.params.userId;
    if (isNaN(userId) || parseInt(userId) <= 0) {
        ErrorResponse.message = "Invalid user ID. Must be a positive number.";
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
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse= "Password required");
    } else if (req.body.auth_method === 'pin' && !req.body.pin) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse.message = "Pin Required");
    }   
    next();
};

module.exports = {
    validateBodyRequest,
    validateGetRequest
}



