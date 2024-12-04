const {StatusCodes} = require('http-status-codes');
const {ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app.error');

function validateGetRequest(req,res,next){
    if(!expenseId){
        ErrorResponse.message = "Something went wrong while getting expense.";
        ErrorResponse.error = new AppError(["Expense Id not found on the incoming request."],StatusCodes.BAD_REQUEST);
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    // Validate if productId is a valid integer
    const expenseId = req.params.expenseId;
    if (isNaN(expenseId) || parseInt(expenseId) <= 0) {
        ErrorResponse.message = "Invalid Expense ID. Must be a positive number.";
        ErrorResponse.error = new AppError(["Expense Id needs to be a positive number."],
        StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
}

function validateBodyRequest(req, res, next){
    if(!req.body.total_cost) {
        ErrorResponse.message = "Something went wrong while creating expense.";
        ErrorResponse.error = new AppError(["total cost not found in the request"],StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(isNaN(req.body.total_cost) || parseInt(req.body.total_cost) <= 0) {
        ErrorResponse.message = "Something is wrong while creating expense.";
        ErrorResponse.error = new AppError(["Total Cost must be a positive number."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(!req.body.description_type){
        ErrorResponse.message = "Something went wrong while creating expense.";
        ErrorResponse.error = new AppError(["Description type is missing in the request."], StatusCodes.BAD_REQUEST);
    }
    if(req.body.description_type == "text" && !req.body.description){
        ErrorResponse.message = "Something went wrong while creating expense.";
        ErrorResponse.error = new AppError(["Descrtiption missing in the request."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(req.body.description_type == "audio" && !req.body.audio_path){
        ErrorResponse.message = "Something went wrong while creating expense.";
        ErrorResponse.error = new AppError(["Audio Path is missing in the request."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(!req.body.payment_date){
        ErrorResponse.message = "Something went wrong while creating expense.";
        ErrorResponse.error = new AppError(["Payment date is missing in the request."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    const validStatusTypes = ["paid", "unpaid", "partial-payment"];
    if(!req.body.payment_status){
        ErrorResponse.message = "Something went wrong while creating expense.";
        ErrorResponse.error = new AppError(["Payment Status Missing."],StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }
    if(!validStatusTypes.includes(req.body.payment_status)){
        ErrorResponse.message = "Something went wrong while creating expense.";
        ErrorResponse.error = new AppError(["Payment Status should be 'paid','unpaid','partial-payment'."],StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }

    if(req.body.payment_status != "paid" && !req.body.due_amount) {
        ErrorResponse.message = "Something went wrong while marking expense.";
        ErrorResponse.error = new AppError(["Add Due Amount"], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    
    if(req.body.payment_status != "paid" && !req.body.due_date) {
        ErrorResponse.message = "Something went wrong while marking expense.";
        ErrorResponse.error = new AppError(["Add Due Date"], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
};

function validatePaidBody(req, res, next){
    if(!req.body.expense_id){
        ErrorResponse.message = "Something went wrong while creating expense.";
        ErrorResponse.error = new AppError(["Expense id Missing."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(isNaN(req.body.expense_id) || parseInt(req.body.expense_id) <= 0) {
        ErrorResponse.message = "Something went wrong while creating expense.";
        ErrorResponse.error = new AppError(["Expense Id must be a positive number."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(!req.body.amount){
        ErrorResponse.message = "Something went wrong while creating expense.";
        ErrorResponse.error = new AppError(["Amount is missing in the request."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(isNaN(req.body.amount) || parseInt(req.body.amount) <= 0) {
        ErrorResponse.message = "Something went wrong while creating expense.";
        ErrorResponse.error = new AppError(["Amount must be a positive number."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    const dueDate = new Date(req.body.due_date);
    const today = new Date();
    // Set the time to 00:00:00 to compare only the date part
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    if(dueDate < today) {
        ErrorResponse.message = "Something went wrong while creating expense.";
        ErrorResponse.error = new AppError(["Due Date cannot be less than today."],StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
}

function validateDateBody(req, res, next){
    if(!req.body.date){
        ErrorResponse.message = "Something went wrong while retrieving expense.";
        ErrorResponse.error = new AppError(["Date is missing in the request."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
}

module.exports = {
    validateBodyRequest,
    validateGetRequest,
    validatePaidBody,
    validateDateBody
}