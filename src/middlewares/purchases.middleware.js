const {StatusCodes} = require('http-status-codes');
const {ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app.error');


function validateGetRequest(req,res,next){

    // Validate if productId is a valid integer
    const purchaseId = req.params.purchaseId;
    if(!purchaseId){
        ErrorResponse.message = "Something went wrong while getting expenses";
        ErrorResponse.error = new AppError(["Purchase Id not found on the incoming request"],StatusCodes.BAD_REQUEST)
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    if (!purchaseId || isNaN(parseInt(purchaseId)) < 1) {
        ErrorResponse.message = "Purchase ID. Must be a positive number.";
        ErrorResponse.message = ErrorResponse;
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
}

function validateDateBody(req, res, next){
    if(!req.body.date) {
        ErrorResponse.message = "Something went wrong while creating expense.";
        ErrorResponse.error = new AppError(["Date not found in the incoming request."], StatusCodes.BAD_REQUEST)
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }
    next();
}

function validateMrkPaidExpense(req, res, next) {
    const { purchase_id, amount } = req.body;

    // Validate purchase_id
    if (!purchase_id || isNaN(parseInt(purchase_id))) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Something went wrong while marking expense.",
            error: new AppError(["Provide a valid Purchase Id."], StatusCodes.BAD_REQUEST)
        });
    }

    // Validate amount
    if (!amount || parseInt(amount) < 1) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Something went wrong while marking expense.",
            error: new AppError(["Invalid Amount"], StatusCodes.BAD_REQUEST)
        });
    }

    next();
}

function validateBodyRequest(req, res, next){
    if(!req.body.products || !Array.isArray(req.body.products)) {
        ErrorResponse.message = "Something went wrong while creating expense.";
        ErrorResponse.error = new AppError(["Products missing/must be an array."],StatusCodes.BAD_REQUEST)
        return  res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }

    if(parseInt(req.body.vendor_id) < 1){
        ErrorResponse.message = "Something went wrong while creating expense.";
        ErrorResponse.error = new AppError(["Vendor ID must be a number"],StatusCodes.BAD_REQUEST)
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

    if (req.body.payment_status !== "paid") { 
        // Check for payment_due_date and due_amount
        if (!req.body.payment_due_date || !req.body.due_amount) {
            ErrorResponse.message = "Something went wrong while creating expense.";
            ErrorResponse.error = new AppError(['Need due date and due amount for unpaid invoice.']);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
    
        // Check if due_amount is a positive number
        if (parseInt(req.body.due_amount) <= 0) {
            ErrorResponse.message = "Something went wrong while creating expense.";
            ErrorResponse.error = new AppError(['Due Amount must be a positive number.']);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
    }
    

   

    if(!req.body.payment_date) {
        ErrorResponse.message = "Something went wrong while adding Expense.";
        ErrorResponse.error = new AppError(["Payment date missing."],StatusCodes.BAD_REQUEST);
        return res
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }

    next();
};

module.exports = {
    validateBodyRequest,
    validateGetRequest,
    validateDateBody,
    validateMrkPaidExpense
}

















