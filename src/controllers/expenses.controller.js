const { StatusCodes } = require("http-status-codes");
const { ExpensesService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const AppError = require("../utils/errors/app.error");


async function addExpense(req, res) {
    try {
        // const user = req.user;
        const { user_id, total_cost,description, description_type, audio_path, payment_date, payment_status  } = req.body;
       
        const expense = await ExpensesService.createExpense({
    
            total_cost,
            description,
            description_type,
            audio_path,
            payment_date,
            payment_status,
            
        });

        // please replace user_id with user.id when authentication has been applied.
        user_data = await UserService.getUser(user_id);
        const currentBalance = user.currentBalance - amount;
        update_user = await UserService.updateUserBalance(user.id, currentBalance);

        balance_trans = await BalanceTransactionService.createBalanceTransactions({
            user_id: user.id,
            transaction_type: "expense",
            amount: total_cost,
            source: "expense",
            previous_balance: user.currentBalance,
            new_balance: currentBalance
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

async function getTodayExpenses(req, res){
    try{  
        const expenses = await ExpensesService.getTodayExpenses(); 
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = expenses;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse)
    }catch(error) {
        console.log(error);
        ErrorResponse.message = "Something went wrong while getting Expenses.";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}

async function getExpensesByDate(req, res){
    try{
        const date = new Date(req.body.date);
        console.log("Controller date", date);
        
        const purchases = await ExpensesService.getExpensesByDate(date); 
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = purchases;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse)
    }catch(error) {
        console.log(error);
        ErrorResponse.message = "Something went wrong while getting Expenses.";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}


module.exports = {
    addExpense,
    getExpense,
    getAllExpenses,
    getTodayExpenses,
    getExpensesByDate
}