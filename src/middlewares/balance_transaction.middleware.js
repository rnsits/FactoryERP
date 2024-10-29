const {StatusCodes} = require('http-status-codes');
const {ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app.error');


function validateBodyRequest(req, res, next){
    
    // Validate the body
    const user = req.user;
    if (isNaN(user.id) || parseInt(user.id) <= 0) {
        ErrorResponse.message = "Something went wrong, while adding transaction.";
        ErrorResponse.error = new AppError(["User Id missing in the incoming request"],StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    const validTransactionTypes = ['income', 'expense'];
    if((!req.body.transaction_type) || !validTransactionTypes.includes(req.body.transaction_type)) {
        ErrorResponse.message = "Something went wrong, while adding transaction.";
        ErrorResponse.error = new AppError(["Invalid transaction type must be 'income', 'expense'."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    const validSourceTypes = ['invoice', 'expense', 'purchase'];
    if((!req.body.source) || !validSourceTypes.includes(req.body.source)) {
        ErrorResponse.message = "Something went wrong, while adding transaction.";
        ErrorResponse.error = new AppError(["Invalid source type must be 'invoice', 'expense', 'purchase'."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(!req.body.amount) {
        ErrorResponse.message = "Something went wrong, while adding transaction.";
        ErrorResponse.error = new AppError(["Amount missing in the incoming request"], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
};

module.exports =  {
    validateBodyRequest
}