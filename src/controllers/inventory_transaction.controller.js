const { StatusCodes } = require("http-status-codes");
const { InventoryTransactionService, ProductService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");

async function addInventoryTransaction(req, res) {
    try {
        const { product_id, transaction_type, quantity, quantity_type, description, description_type, audio_path } = req.body;

        const inventoryTransaction = await InventoryTransactionService.createInventoryTransaction({
            product_id,
            transaction_type,
            quantity,
            quantity_type,
            description,
            description_type,
            audio_path
        });
        SuccessResponse.message = "Inventory Transaction added successfully";
        SuccessResponse.data = inventoryTransaction;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.message = "Failed to add inventory transaction.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
    
}

async function getInventoryTransaction(req,res){
    try{
        const inventory = await InventoryTransactionService.getInventoryTransaction(req.params.inventoryTransactionId);
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = inventory;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse) 
    } catch (error) {
        console.log(error);
        ErrorResponse.message = "Something went wrong while getting Inventory Transaction.";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}

async function getAllInventoryTransactions(req, res){
    try{
        const inventortyTransactions = await InventoryTransactionService.getAllInventoryTransactions(); 
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = users;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse)
    }catch(error) {
        console.log(error);
        ErrorResponse.message = "Something went wrong while getting Inventory Transactions.";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}


module.exports = {
    addInventoryTransaction,
    getAllInventoryTransactions,
    getInventoryTransaction
}