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

module.exports = {
    addBalanceTransactions
}