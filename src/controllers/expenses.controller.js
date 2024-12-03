const { StatusCodes } = require("http-status-codes");
const { ExpensesService, UserService, BalanceTransactionService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const AppError = require("../utils/errors/app.error");
const { sequelize } = require("../models");


async function addExpense(req, res) {
    const transaction = await sequelize.transaction();
    try {
        const user_id = req.user.id;
        
        const { total_cost,description, description_type, payment_date, payment_status, due_date, due_amount  } = req.body;
       
        // Validate due amount logic based on payment status
        let finalDueAmount = 0;
        let finalDueDate = null;
        let audioPath = req.file ? `/uploads/audio/${req.file.filename}`: null;

        switch(payment_status) {
            case 'paid':
                // No due amount or due date for paid status
                finalDueAmount = 0;
                finalDueDate = null;
                break;
            
            case 'unpaid':
                // For unpaid, due amount is the full total cost
                finalDueAmount = total_cost;
                
                // Require due date for unpaid status
                if (!due_date) {
                    throw new AppError(['Due date is required for unpaid expenses'],StatusCodes.BAD_REQUEST);
                }
                finalDueDate = due_date;
                break;
            
            case 'partial-payment':
                // For partial payment, user provides due amount and due date
                if (!due_amount || !due_date) {
                    throw new AppError(['Both due amount and due date are required for partial payments'], StatusCodes.BAD_REQUEST);
                }
                
                // Ensure due amount is less than total cost
                if (due_amount >= total_cost) {
                    throw new AppError(['Partial payment amount must be less than total cost'], StatusCodes.BAD_REQUEST);
                }
                
                finalDueAmount = due_amount;
                finalDueDate = due_date;
                
                // Reduce balance by the amount paid
                const user_data = await UserService.getUser(user_id);
                const currentBalance = user_data.current_balance - (total_cost-due_amount);
                await UserService.updateUserBalance(user_data.id, currentBalance, {transaction});

                // Create balance transaction for partial payment
                await BalanceTransactionService.createBalanceTransactions({
                    user_id: user_data.id,
                    transaction_type: "partial-expense",
                    amount: currentBalance,
                    source: "expense",
                    previous_balance: user_data.current_balance,
                    new_balance: currentBalance
                }, {transaction});
                break;
            
            default:
                throw new Error('Invalid payment status');
        }
       
        const expense = await ExpensesService.createExpense({
    
            total_cost,
            description,
            description_type,
            audio_path: audioPath,
            payment_date,
            payment_status,
            due_amount: finalDueAmount,
            due_date: finalDueDate
            
        }, {transaction});

        let balance_trans;
        if(payment_status == "paid") {
            user_data = await UserService.getUser(user_id);
            const currentBalance = user_data.current_balance - total_cost;
            update_user = await UserService.updateUserBalance(user_data.id, currentBalance, {transaction});

            balance_trans = await BalanceTransactionService.createBalanceTransactions({
                user_id: user_data.id,
                transaction_type: "expense",
                amount: total_cost,
                source: "expense",
                previous_balance: user_data.current_balance,
                new_balance: currentBalance
            }, {transaction});
        }        

        await transaction.commit();

        SuccessResponse.message = "Expense added successfully";
        SuccessResponse.data = { expense, user_id, balance_trans };
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        console.log(error);
        await transaction.rollback();
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
        const filter = req.query.filter || null;

        const { count, rows } = await ExpensesService.getAllExpenses(limit, offset, search, fields, filter);

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
        const date = new Date();

        const { count, rows } = await ExpensesService.getExpensesByDate(date, limit, offset, search, fields);
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
        const date = new Date(req.body.date);
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit; 
        const search = req.query.search || '';
        const fields = req.query.fields ? req.query.fields.split(',') : [];

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
    
        const { count, rows, totalUnPaidAmount } = await ExpensesService.getUnpaidExpenses( limit, offset, search, fields);
        
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = {
            expenses: rows,
            totalCount: count,
            totalUnPaidAmount: totalUnPaidAmount ?? 0.00,
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
        const {expense_id, amount} = req.body;
        const user_id = req.user.id;
        if (amount < 0) {
            throw new AppError(["Amount cannot be negative."], StatusCodes.BAD_REQUEST);
        }

        const expense = await ExpensesService.getExpense(expense_id);
        if (!expense) {
            throw new AppError(["No expense found for the ID provided."], StatusCodes.NOT_FOUND);
        }

        if(expense.payment_status == "paid" || expense.due_amount == 0){
            throw new AppError([`Expense already marked paid`], StatusCodes.BAD_REQUEST);
        }
        // todo : add middleware to check if amount entered is not negative.
        if(amount > expense.due_amount && amount > expense.total_cost){
            throw new AppError([`Check amount it is greater than due amount or total cost.`], StatusCodes.BAD_REQUEST);
        }

        // const newAmount = expense.due_amount - amount;
        // const status = newAmount == 0 ? "paid" : "partial-payment";

        let status = expense.payment_status;
        let finalDueAmount;
        // let payment_method = invoice.payment_method;
        const newAmount = expense.due_amount - Number(amount);
        status = newAmount == 0 ? "paid" : "partial-payment";
        finalDueAmount = newAmount == 0 ? 0 : newAmount;

        const updateExpense = await ExpensesService.markExpensePaid(expense.id, status, finalDueAmount, { transaction });    

        // Get current user balance
        const user = await UserService.getUser(user_id); 
        const currentBalance = Number(user.current_balance);
        const newBalance = currentBalance - Number(amount);

        // Create balance transaction
        await BalanceTransactionService.createBalanceTransactions({
            user_id: user_id, // Fixed: changed user.id to customer_id
            transaction_type: "expense",
            amount: amount,
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