const {StatusCodes} = require('http-status-codes');
const {ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app.error');
const { validateDateFormat }= require('../utils/common/datevalidator');


function validateGetRequest(req,res,next){

    // Validate if productId is a valid integer
    const purchaseId = req.params.purchaseId;
    if (isNaN(purchaseId) || parseInt(purchaseId) <= 0) {
        ErrorResponse.message = "Purchase ID. Must be a positive number.";
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(!purchaseId){
        ErrorResponse.message = "Something went wrong while getting expenses";
        ErrorResponse.error = new AppError(["Purchase Id not found on the incoming request"],StatusCodes.BAD_REQUEST)
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    next();
}

function validateDateBody(req, res, next){
    const date = req.body.date;
    if(!date) {
        ErrorResponse.message = "Something went wrong while creating expense.";
        ErrorResponse.error = new AppError(["Date not found in the incoming request."], StatusCodes.BAD_REQUEST)
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }
    next();
}

function validateBodyRequest(req, res, next){

    if(!req.body.vendor_id || isNaN(req.body.vendor_id) || parseInt(req.body.purchaseId) <= 0){
        ErrorResponse.message = "Something went wrong while creating expense.";
        ErrorResponse.error = new AppError(["Vendor ID must be a number, missing."],StatusCodes.BAD_REQUEST)
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }

    if(!req.body.products || !Array.isArray(req.body.products)) {
        ErrorResponse.message = "Something went wrong while creating expense.";
        ErrorResponse.error = new AppError(["Products missing/must be an array."],StatusCodes.BAD_REQUEST)
        return  res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }

    if(!req.body.payment_date) {
        ErrorResponse.message = "Something went wrong while adding Expense.";
        ErrorResponse.error = new AppError(["Payment date missing."],StatusCodes.BAD_REQUEST);
        return res
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }

    if(req.body.payment_status !== "paid" 
        && !req.body.payment_due_date){
        ErrorResponse.message = "Something went wrong while adding Expense.";
        ErrorResponse.error = new AppError(["Payment Due Date not found on the incoming request"],StatusCodes.BAD_REQUEST)
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }

    const validStatusTypes = ["paid", "unpaid", "partial-payment"];

    if(!req.body.payment_status || !validStatusTypes.includes(req.body.payment_status)){
        ErrorResponse.message = "Something went wrong while creating expense.";
        ErrorResponse.error = new AppError(["Payment Status should be 'paid','unpaid','partial-payment'."],StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }

    if(!req.body.invoice_Bill) {
        ErrorResponse.message = "Something went wrong while creating expense.";
        ErrorResponse.error = new AppError(["Invoice Bill missing in the incoming request"],StatusCodes.BAD_REQUEST);
        return res 
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }
    next();
};

module.exports = {
    validateBodyRequest,
    validateGetRequest,
    validateDateBody
}

















