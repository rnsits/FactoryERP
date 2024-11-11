const { StatusCodes } = require("http-status-codes");
const { ExpensesService, UserService, BalanceTransactionService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");


async function addExpense(req, res) {
    try {
        const user_id = req.user.id;
        const { total_cost,description, description_type, audio_path, payment_date, payment_status  } = req.body;
       
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
        const currentBalance = user_data.current_balance - total_cost;
        update_user = await UserService.updateUserBalance(user_data.id, currentBalance);

        balance_trans = await BalanceTransactionService.createBalanceTransactions({
            user_id: user_data.id,
            transaction_type: "expense",
            amount: total_cost,
            source: "expense",
            previous_balance: user_data.current_balance,
            new_balance: currentBalance
        });

        SuccessResponse.message = "Expense added successfully";
        SuccessResponse.data = { expense, user_data, balance_trans };
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
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit; 
        const search = req.query.search || '';
        const fields = req.query.fields ? req.query.fields.split(',') : [];

        const { count, rows } = await ExpensesService.getAllExpenses(limit, offset, search);

        SuccessResponse.message = "Expenses retrieved successfully.";
        SuccessResponse.data = {
            expenses: rows,
            totalCount: count, 
            totalPages: Math.ceil(count / limit), 
            currentPage: page,
            pageSize: limit
        };
        return res.status(StatusCodes.OK).json(SuccessResponse);
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
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit; 
        const search = req.query.search || '';
        const fields = req.query.fields ? req.query.fields.split(',') : [];

        const { count, rows } = await ExpensesService.getTodayExpenses(limit, offset, search);
        SuccessResponse.message = "Expenses for today retrieved successfully.";
        SuccessResponse.data = {
            expenses: rows,
            totalCount: count, 
            totalPages: Math.ceil(count / limit), 
            currentPage: page,
            pageSize: limit
        }; 
        // SuccessResponse.message = "Successfully completed the request";
        // SuccessResponse.data = expenses;
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
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit; 
        const search = req.query.search || '';
        const fields = req.query.fields ? req.query.fields.split(',') : [];
        const date = new Date(req.body.date);
        console.log("Controller date", date);
        
        // const purchases = await ExpensesService.getExpensesByDate(date); 
        // Fetch the expenses for the given date with pagination
        const { count, rows } = await ExpensesService.getExpensesByDate(date, limit, offset, search, fields);
        
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = {
            expenses: rows,
            totalCount: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            pageSize: limit
          }
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