const { StatusCodes } = require("http-status-codes");
const { BalanceTransactionService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");

async function addBalanceTransactions(req, res) {
    try {
        // const user_id = req.user;
        const { user_id, transaction_type, amount, source, previous_balance, new_balance  } = req.body;
        const balance = await BalanceTransactionService.createBalanceTransactions({
            user_id, transaction_type, amount, source, previous_balance, new_balance  
        });
        SuccessResponse.message = "Balance Transaction added successfully.";
        SuccessResponse.data = balance;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.message = "Failed to add Balance Transaction.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
    
}

async function getBalanceTransactions(req,res){
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit; 
        const search = req.query.search || '';
        const fields = req.query.fields ? req.query.fields.split(',') : [];

        const { count, rows } = await BalanceTransactionService.getAllBalanceTransactions(limit, offset, search);

        SuccessResponse.message = "Balance Transactions retrieved successfully.";
        SuccessResponse.data = {
            transactions: rows,
            totalCount: count, 
            totalPages: Math.ceil(count / limit), 
            currentPage: page,
            pageSize: limit
        };
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.message = "Failed to fetch balance transactions.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

module.exports = {
    addBalanceTransactions,
    getBalanceTransactions
}