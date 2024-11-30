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
   
    if(req.body.payment_status != 'paid' && !req.body.due_amount){
        ErrorResponse.message = "Something went wrong while creating Invoice.";
        ErrorResponse.error = new AppError(["Due Date is invalid."]);
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
    if(req.body.pincode.length < 6 || req.body.pincode.length > 6){
        ErrorResponse.message = "Something went wrong while creating customers.";
        ErrorResponse.error = new AppError(["Pincode length must be 6"], StatusCodes.BAD_REQUEST);
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
    if(req.body.mobile.length < 10 || req.body.pincode.length > 10){
        ErrorResponse.message = "Something went wrong while creating customers.";
        ErrorResponse.error = new AppError(["Mobile length must be 6"], StatusCodes.BAD_REQUEST);
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

function validateDateBody(req, res, next) {
    if(!req.body.date) {
        ErrorResponse.message = "Something went wrong while creating Invoice.";
        ErrorResponse.error = new AppError(["Date Missing."], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }
    next();
}

function validatePaidBody(req, res, next){
    if(!req.body.id){
        ErrorResponse.message = "Something went wrong while creating Invoice.";
        ErrorResponse.error = new AppError(["Invoice Id(id) is Missing."], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }
    if(!req.body.amount){
        ErrorResponse.message = "Something went wrong while creating Invoice.";
        ErrorResponse.error = new AppError(["Amount Missing."], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }
    if(isNaN(req.body.amount) || (parseInt(req.body.amount))) {
        ErrorResponse.message = "Something went wrong while marking Invoice paid/partial-paid.";
        ErrorResponse.error = new AppError(['Amount must be a number.'], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
}

function updateImage(req, res, next){
    if(!req.body.id) {
      ErrorResponse.message = "Something went wrong while updating image";
      ErrorResponse.error = new AppError(["Id missing."], StatusCodes.BAD_REQUEST);
      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(isNaN(parseInt(req.body.id))) {
      ErrorResponse.message = "Something went wrong while updating image";
      ErrorResponse.error = new AppError(["Invalid Id"], StatusCodes.BAD_REQUEST);
      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(!req.file) {
        ErrorResponse.message = "Something went wrong while updating image";
        ErrorResponse.error = new AppError(["Missing Image"], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
}


module.exports = {
    validateGetRequest,
    validateBodyRequest,
    validateDateBody,
    validatePaidBody,
    updateImage
}
