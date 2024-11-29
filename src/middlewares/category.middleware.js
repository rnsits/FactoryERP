const {StatusCodes} = require('http-status-codes');
const {ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app.error');


function validateGetRequest(req,res,next){

    // Validate if productId is a valid integer
    const categoryId = req.params.categoryId;
    if (isNaN(categoryId) || parseInt(categoryId) <= 0) {
        ErrorResponse.message = "Category ID. Must be a positive number.";
        ErrorResponse.error = new AppError(["Category Id not found on the incoming request"],StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(!categoryId){
        ErrorResponse.message = "Something went wrong while getting category";
        ErrorResponse.error = new AppError(["Category Id not found on the incoming request"],StatusCodes.BAD_REQUEST);
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    next();
}

function validateBodyRequest(req, res, next){

    // Validate product id to be either "audio" or "text"
    if(!req.body.name){
        ErrorResponse.message = "Something went wrong while Category.";
        ErrorResponse.error = new AppError(["Name not found on the incoming request"],StatusCodes.BAD_REQUEST);
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    
     // Validate description_type to be either "audio" or "text"
     const validDescriptionTypes = ["audio", "text"];
     if (!validDescriptionTypes.includes(req.body.description_type)) {
         ErrorResponse.message = "Something went wrong while Category.";
         ErrorResponse.error = new AppError(["Invalid description type. Allowed types are 'audio' and 'text'."],StatusCodes.BAD_REQUEST);
         return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
     }
 
     // If description_type is "audio", ensure audio_path is provided
     if (req.body.description_type == "audio" && !req.body.audio_path) {
         ErrorResponse.message = "Something went wrong while Category.";
         ErrorResponse.error = new AppError(["Audio Path missing in the incoming request"],StatusCodes.BAD_REQUEST);
         return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
     }
     
     // desription is text need description
     if(req.body.description_type == "text" && !req.body.description) {
         ErrorResponse.message = "Something went wrong while Category.";
         ErrorResponse.error = new AppError(["Description must be provided when type is 'text'."],StatusCodes.BAD_REQUEST);
         return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
     }

    next();
};

module.exports = {
    validateBodyRequest,
    validateGetRequest
}