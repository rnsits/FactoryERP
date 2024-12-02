const {StatusCodes} = require('http-status-codes');
const {ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app.error');


function validateGetRequest(req,res,next){

    // Validate if productId is a valid integer
    const purchaseId = req.params.purchaseId;
    if(!purchaseId){
        ErrorResponse.message = "Something went wrong while getting purchases";
        ErrorResponse.error = new AppError(["Purchase Id not found on the incoming request"],StatusCodes.BAD_REQUEST)
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    if (isNaN(purchaseId) || parseInt(purchaseId) < 1) {
        ErrorResponse.message = "Purchase ID. Must be a positive number.";
        ErrorResponse.message = new AppError(["Purchase Id must be a valid number."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
}

function validateDateBody(req, res, next){
    if(!req.body.date) {
        ErrorResponse.message = "Something went wrong while creating purchases.";
        ErrorResponse.error = new AppError(["Date not found in the incoming request."], StatusCodes.BAD_REQUEST)
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }
    next();
}

function validateMrkPaidExpense(req, res, next) {
    // const { purchase_id, amount } = req.body;

    if(!req.body.purchase_id) {
        ErrorResponse.message = "Something went wrong while marking purchases.";
        ErrorResponse.error = new AppError(["Purchase Id missing."], StatusCodes.BAD_REQUEST)
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }
    // Validate purchase_id
    if (isNaN(parseInt(req.body.purchase_id))) {
        ErrorResponse.message = "Something went wrong while marking purchases.";
        ErrorResponse.error = new AppError(["Invalid Purchase Id."], StatusCodes.BAD_REQUEST)
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }
    
    if(!req.body.amount) {
        ErrorResponse.message = "Something went wrong while marking purchases.";
        ErrorResponse.error = new AppError(["Amount missing."], StatusCodes.BAD_REQUEST)
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }
    // Validate amount
    if (isNaN(req.body.amount) || parseInt(req.body.amount) < 1) {
        ErrorResponse.message = "Something went wrong while marking purchases.";
        ErrorResponse.error = new AppError(["Invalid Amount"], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    next();
}

function validateBodyRequest(req, res, next){
    const paymentDate = new Date(req.body.payment_date);
    const paymentDueDate = new Date(req.body.payment_due_date);
    if(!req.body.products || !Array.isArray(req.body.products)) {
        ErrorResponse.message = "Something went wrong while creating purchase.";
        ErrorResponse.error = new AppError(["Products missing/must be an array."],StatusCodes.BAD_REQUEST)
        return  res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }

    if(parseInt(req.body.vendor_id) < 1){
        ErrorResponse.message = "Something went wrong while creating purchase.";
        ErrorResponse.error = new AppError(["Vendor ID must be a number"],StatusCodes.BAD_REQUEST)
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }

    if(!req.body.payment_status) {
        ErrorResponse.message = "Something went wrong while creating purchase.";
        ErrorResponse.error = new AppError(["Payment Status Missing."],StatusCodes.BAD_REQUEST)
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }

    const validStatusTypes = ["paid", "unpaid", "partial-payment"];
    if(!validStatusTypes.includes(req.body.payment_status)){
        ErrorResponse.message = "Something went wrong while creating purchase.";
        ErrorResponse.error = new AppError(["Payment Status should be 'paid','unpaid','partial-payment'."],StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }

    if (req.body.payment_status !== "paid") { 
        // Check for payment_due_date and due_amount
        if (!paymentDueDate) {
            ErrorResponse.message = "Something went wrong while creating purchase.";
            ErrorResponse.error = new AppError(['Missing payment due date.']);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
        if (!req.body.due_amount) {
            ErrorResponse.message = "Something went wrong while creating purchase.";
            ErrorResponse.error = new AppError(['Missing due amount']);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
        // Check if due_amount is a positive number
        if (parseInt(req.body.due_amount) <= 0) {
            ErrorResponse.message = "Something went wrong while creating purchase.";
            ErrorResponse.error = new AppError(['Due Amount must be a positive number.']);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
        if(paymentDueDate < paymentDate) {
            ErrorResponse.message = "Something went wrong while creating purchase.";
            ErrorResponse.error = new AppError(['Due date must be greater than payment date.']);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
        }
        
    }

    if(!req.body.payment_date) {
        ErrorResponse.message = "Something went wrong while adding Purchase.";
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

















