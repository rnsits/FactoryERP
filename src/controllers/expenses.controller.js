const { StatusCodes } = require("http-status-codes");
const { ExpensesService, UserService, BalanceTransactionService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const AppError = require("../utils/errors/app.error");
const { sequelize } = require("../models");


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

        const { count, rows } = await ExpensesService.getAllExpenses(limit, offset, search, fields);

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

        const { count, rows } = await ExpensesService.getTodayExpenses(limit, offset, search, fields);
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
        ErrorResponse.message = "Something went wrong while getting Expenses.";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}

async function getUnpaidExpenses(req, res){
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit; 
        const search = req.query.search || '';
        const fields = req.query.fields ? req.query.fields.split(',') : [];
    
        const { count, rows } = await ExpensesService.getUnpaidExpenses( limit, offset, search, fields);
        
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
    } catch (error) {
        ErrorResponse.message = "Something went wrong while getting Expenses.";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}

async function markExpensePaid(req, res){
    const transaction = await sequelize.transaction();

    try {
        const {expenses} = req.body;
        const user_id = req.user.id;
        if (expenses.amount < 0) {
            throw new AppError("Amount cannot be negative.", StatusCodes.BAD_REQUEST);
        }

        const expense = await ExpensesService.getExpense(expenses.id);
        if (!expense) {
            throw new AppError("No expense found for the ID provided.", StatusCodes.NOT_FOUND);
        }

        if(expense.payment_status === "paid"){
            throw new AppError(`Expense already marked paid`, StatusCodes.BAD_REQUEST);
        }
        // todo : add middleware to check if amount entered is not negative.
        if(expenses.amount > expense.total_cost){
            throw new AppError(`Amount paid is greater than the total cost of the expense.`, StatusCodes.BAD_REQUEST);
        }

        let status = expense.payment_status;
        const newAmount = expense.total_cost - expenses.amount;
        status = newAmount === 0 ? "paid" : "partial-payment";
        

        const updateExpense = await ExpensesService.markExpensePaid(expenses.id, newAmount, status, { transaction });    

        // Get current user balance
        const user = await UserService.getUser(user_id); 
        const currentBalance = Number(user.current_balance);
        const newBalance = currentBalance - Number(expenses.amount);

        // Create balance transaction
        await BalanceTransactionService.createBalanceTransactions({
            user_id: user_id, // Fixed: changed user.id to customer_id
            transaction_type: "expense",
            amount: expenses.amount,
            source: "expense",
            previous_balance: currentBalance,
            new_balance: newBalance
        }, { transaction });

        // Update user balance
        await UserService.updateUserBalance(
            user_id, // Fixed: changed user.id to customer_id
            newBalance, 
            { transaction }
        );

        await transaction.commit();

        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = {
            updateExpense
        }
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        console.log(error);
        await transaction.rollback();
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
    getExpensesByDate,
    getUnpaidExpenses,
    markExpensePaid
}