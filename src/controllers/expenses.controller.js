const { StatusCodes } = require("http-status-codes");
const { ExpensesService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const AppError = require("../utils/errors/app.error");


async function addExpense(req, res) {
    try {
        const { total_cost,description, description_type, audio_path, payment_date, payment_status  } = req.body;
       
        const expense = await ExpensesService.createExpense({
    
            total_cost,
            description,
            description_type,
            audio_path,
            payment_date,
            payment_status,
            
        });
        SuccessResponse.message = "Expense added successfully";
        SuccessResponse.data = expense;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.message = "Failed to add expense.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
    
}

async function getExpense(req,res){
    try{
        const purchase = await ExpensesService.getExpense(req.params.expenseId);
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = purchase;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse) 
    } catch (error) {
        console.log(error);
        ErrorResponse.message = "Something went wrong while getting Expense";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}

async function getAllExpenses(req, res){
    try{
        const purchases = await ExpensesService.getAllExpenses(); 
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = purchases;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse)
    }catch(error) {
        console.log(error);
        ErrorResponse.message = "Something went wrong while getting Expenses";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}


module.exports = {
    addExpense,
    getExpense,
    getAllExpenses
}