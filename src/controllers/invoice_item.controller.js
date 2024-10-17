const { StatusCodes } = require("http-status-codes");
const { Invoice_ItemService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");

async function addInvoiceItem(req, res) {
    try {
        const { product_id, quantity, quantity_type, unit_price  } = req.body;
       
        const item = await Invoice_ItemService.createInvoice_Item({
            product_id,
            quantity,
            quantity_type,
            unit_price
        });
        SuccessResponse.message = "Invoice Item added successfully";
        SuccessResponse.data = item;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.message = "Failed to add Invoice Item.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
    
}

async function getInvoiceItem(req,res){
    try{
        const item = await Invoice_ItemService.getInvoiceItem(req.params.invoiceItemId);
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = item;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse) 
    } catch (error) {
        console.log(error);
        ErrorResponse.message = "Something went wrong while getting Item";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}

async function getAllInvoiceItems(req, res){
    try{
        const items = await Invoice_ItemService.getAllInvoiceItems(); 
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = items;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse)
    }catch(error) {
        console.log(error);
        ErrorResponse.message = "Something went wrong while getting Invoice Items";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}


module.exports = {
    addInvoiceItem,
    getInvoiceItem,
    getAllInvoiceItems
}