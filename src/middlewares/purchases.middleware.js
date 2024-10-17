const {StatusCodes} = require('http-status-codes');
const {ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app.error');
const  {validateDateFormat} = require('../utils/common/datevalidator');


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

function validateBodyRequest(req, res, next){

    // vendor_id,invoice_Bill
    // Validate product id to be either "audio" or "text"
    if(!req.body.total_cost){
        ErrorResponse.message = "Something went wrong while creating expense.";
        ErrorResponse.error = new AppError(["Total Cost not found on the incoming request"],StatusCodes.BAD_REQUEST)
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }

    if(!req.body.product_id){
        ErrorResponse.message = "Something went wrong while creating expense.";
        ErrorResponse.error = new AppError(["Product ID not found on the incoming request"],StatusCodes.BAD_REQUEST)
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }

    if(!req.body.vendor_id){
        ErrorResponse.message = "Something went wrong while creating expense.";
        ErrorResponse.error = new AppError(["Vendor ID not found on the incoming request"],StatusCodes.BAD_REQUEST)
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }

    if(!req.body.quantity) {
        ErrorResponse.message = "Something went wrong while creating expense.";
        ErrorResponse.error = new AppError(["Quantity not found in the incoming request."],StatusCodes.BAD_REQUEST)
        return  res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }

     // Validate description_type to be either "audio" or "text"
     const validQuantityTypes = ['kg', 'tonne', 'quintal', 'l', 'ml', 'm', 'cm', 'pcs', 'metric_cube'];
     if (!validQuantityTypes.includes(req.body.quantity_type)) {
         ErrorResponse.message = "Invalid Quantity type. Allowed types are 'kg', 'tonne', 'quintal', 'l', 'ml', 'm', 'cm', 'pcs', 'metric_cube'.";
         return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
     }

     if(!req.body.payment_date || !validateDateFormat(req.body.payment_date)) {
        ErrorResponse.message = "Something went wrong while adding Expense.";
        ErrorResponse.error = new AppError(["Invalid Payment Date or Payment date missing."],StatusCodes.BAD_REQUEST);
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

    if(req.body.payment_due_date && !validateDateFormat(req.body.payment_due_date)) {
        ErrorResponse.message = "Something went wrong while adding Expense.";
        ErrorResponse.error = new AppError(["Invalid Payment Date"],StatusCodes.BAD_REQUEST);
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
};

module.exports = {
    validateBodyRequest,
    validateGetRequest
}

















