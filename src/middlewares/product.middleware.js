const {StatusCodes} = require('http-status-codes');
const {ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app.error');

function validateGetRequest(req,res,next){

    // Validate if productId is a valid integer
    const productId = req.params.productId;
    if (isNaN(productId) || parseInt(productId) <= 0) {
        ErrorResponse.message = "Invalid product ID. Must be a positive number.";
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(!productId){
        ErrorResponse.message = "Something went wrong while getting product";
        ErrorResponse.error = new AppError(["Product Id not found on the incoming request"],StatusCodes.BAD_REQUEST)
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    next();
}

function validateBodyRequest(req, res, next){

    // Validate description_type to be either "audio" or "text"
    const validDescriptionTypes = ["audio", "text"];
    if (!validDescriptionTypes.includes(req.body.description_type)) {
        ErrorResponse.message = "Invalid description type. Allowed types are 'audio' and 'text'.";
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    // If description_type is "audio", ensure audio_path is provided
    if (req.body.description_type === "audio" && !req.body.audio_path) {
        ErrorResponse.message = "Audio path must be provided when description type is 'audio'.";
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    
    // desription is text need description
    if(req.body.description_type === "text" && !req.body.description) {
        ErrorResponse.message = "Description must be provided when type is 'text'.";
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    // Validate quantity_type to be one of the allowed values
    const validQuantityTypes = ["kg", "l", "m", "pcs"]; // Add more as needed
    if (!validQuantityTypes.includes(req.body.quantity_type)) {
        ErrorResponse.message = "Invalid quantity type. Allowed types are 'kg', 'l', 'm', 'pcs'.";
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    //Validate image path
    if(!req.body.product_image) {
        ErrorResponse.message = "Image path missing.";
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
};

module.exports = {
    validateBodyRequest,
    validateGetRequest
}