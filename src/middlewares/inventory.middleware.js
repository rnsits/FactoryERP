const {StatusCodes} = require('http-status-codes');
const {ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app.error');


function validateGetRequest(req,res,next){


    const inventoryId = req.params.inventoryId;
    if (isNaN(inventoryId) || parseInt(inventoryId) <= 0) {
        ErrorResponse.message = "Invalid  inventoryId. Must be a positive number.";
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(!inventoryId){
        ErrorResponse.message = "Something went wrong while getting user.";
        ErrorResponse.error = new AppError(["Inventory Id not found on the incoming request"],StatusCodes.BAD_REQUEST)
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    next();
}

function validateBodyRequest(req, res, next){
    
    if(!req.body.current_stock || !req.body.unit_cost) {
        ErrorResponse.message = "Something went wrong while creating expense.";
        ErrorResponse.error = new AppError(["Current Stock or Unit Cost not found in the request"],StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    // Validate description_type to be either "audio" or "text"
    const validQuantityTypes = ['kg', 'tonne', 'quintal', 'l', 'ml', 'm', 'cm', 'pcs', 'metric_cube'];
    if (!validQuantityTypes.includes(req.body.quantity_type)) {
        ErrorResponse.message = "Invalid Quantity type. Allowed types are 'kg', 'tonne', 'quintal', 'l', 'ml', 'm', 'cm', 'pcs', 'metric_cube'.";
        ErrorResponse.error = new AppError(["Invalid Quantity Type."])
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
};

module.exports = {
    validateBodyRequest,
    validateGetRequest
}
