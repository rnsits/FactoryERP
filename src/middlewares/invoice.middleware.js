const {StatusCodes} = require('http-status-codes');
const {ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app.error');
const { validateDateFormat } = require('../utils/common/datevalidator');

function validateGetRequest(req,res,next){

    const invoice_id = req.params.invoiceId;
    if (isNaN(invoice_id) || parseInt(invoice_id) <= 0) {
        ErrorResponse.message = "Something went wrong while getting customers.";
        ErrorResponse.error = new AppError(["Invoice ID. Must be a positive number."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(!invoice_id){
        ErrorResponse.message = "Something went wrong while getting customers.";
        ErrorResponse.error = new AppError(["Invoice Id not found on the incoming request"],StatusCodes.BAD_REQUEST);
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    next();
}

function validateBodyRequest(req, res, next) {
    
    if(!req.body.customer_id){
        ErrorResponse.message = "Something went wrong while creating customers.";
        ErrorResponse.error = new AppError(["Customer Id missing in the incoming request"],StatusCodes.BAD_REQUEST);
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    if(!req.body.invoice_item_id){
        ErrorResponse.message = "Something went wrong while creating customers.";
        ErrorResponse.error = new AppError(["Invoice Item Id missing in the incoming request"],StatusCodes.BAD_REQUEST);
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    if(req.body.due_date && !validateDateFormat(req.body.due_date)){
        ErrorResponse.message = "Something went wrong while creating Invoice.";
        ErrorResponse.error = new AppError(["Due Date is invalid."]);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }
    if(!validateDateFormat(req.body.invoice_date)){
        ErrorResponse.message = "Something went wrong while creating Invoice.";
        ErrorResponse.error = new AppError(["Invoice Date is invalid."]);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }
    if(req.body.due_amount && req.body.due_amount < 1){
        ErrorResponse.message = "Something went wrong while creating customers.";
        ErrorResponse.error = new AppError(["Due Amount cannot be less than one."],StatusCodes.BAD_REQUEST);
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    if(!req.body.address){
        ErrorResponse.message = "Something went wrong while creating customers.";
        ErrorResponse.error = new AppError(["Address not found on the incoming request"],StatusCodes.BAD_REQUEST);
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse);
    }
    if(!req.body.pincode){
        ErrorResponse.message = "Something went wrong while creating customers.";
        ErrorResponse.error = new AppError(["Pincode missing in the incoming request."], StatusCodes.BAD_REQUEST);
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse);
    }
    if(!req.body.mobile){
        ErrorResponse.message = "Something went wrong while creating Invoice.";
        ErrorResponse.error = new AppError(["Mobile missing in the incoming request."], StatusCodes.BAD_REQUEST);
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse);
    }
    if(!req.body.customer_payment_image){
        ErrorResponse.message = "Something went wrong while creating Invoice.";
        ErrorResponse.error = new AppError(["Customer Payment Image missing in the incoming request."], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }
    const validStatusTypes = ["paid", "unpaid", "partial-payment"];
    if(!req.body.payment_status || !validStatusTypes.includes(req.body.payment_status)){
        ErrorResponse.message = "Something went wrong while creating expense.";
        ErrorResponse.error = new AppError(["Payment Status should be 'paid','unpaid','partial-payment'."],StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }
    const validPaymentMethods = ["cash", "digital-payment"];
    if(!req.body.payment_method || !validPaymentMethods.includes(req.body.payment_method) ){
        ErrorResponse.message = "Something went wrong while creating Invoice.";
        ErrorResponse.error = new AppError(["Invalid Payment Type or Missing Payment Method."], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }
    next();
}


module.exports = {
    validateGetRequest,
    validateBodyRequest
}
