const { StatusCodes } = require("http-status-codes");
const { PurchaseService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");

async function addPurchase(req, res) {
    try {
        const { product_id, quantity, quantity_type, total_cost, payment_date, payment_status, payment_due_date, vendor_id, invoice_Bill } = req.body;
       
        const purchase = await PurchaseService.createPurchase({
            product_id,
            quantity,
            quantity_type,
            total_cost,
            payment_date,
            payment_status,
            payment_due_date,
            vendor_id,
            invoice_Bill
        });
        SuccessResponse.message = "Purchase added successfully";
        SuccessResponse.data = purchase;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.message = "Failed to add purchase.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
    
}

async function getPurchase(req,res){
    try{
        const purchase = await PurchaseService.getPurchase(req.params.purchaseId);
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = purchase;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse) 
    } catch (error) {
        console.log(error);
        ErrorResponse.message = "Something went wrong while getting Purchase";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}

async function getAllPurchases(req, res){
    try{
        const purchases = await PurchaseService.getAllPurchases(); 
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = purchases;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse)
    }catch(error) {
        console.log(error);
        ErrorResponse.message = "Something went wrong while getting Purchases";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}


module.exports = {
    addPurchase,
    getPurchase,
    getAllPurchases
}