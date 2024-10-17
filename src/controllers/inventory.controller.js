const { StatusCodes } = require("http-status-codes");
const { InventoryService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");

async function addInventory(req, res) {
    try {
        const { current_stock, unit_cost, quantity_type  } = req.body;
       
        let total_cost = req.body.total_cost;
        total_cost = current_stock*unit_cost;
        const inventory = await InventoryService.createInventory({
            current_stock, unit_cost, total_cost, quantity_type
        });
        SuccessResponse.message = "Inventory added successfully";
        SuccessResponse.data = inventory;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.message = "Failed to add inventory.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
    
}

async function getInventory(req,res){
    try{
        const inventory = await InventoryService.getInventory(req.params.inventoryId);
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = inventory;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse) 
    } catch (error) {
        console.log(error);
        ErrorResponse.message = "Something went wrong while getting Inventory";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}

async function getAllInventories(req, res){
    try{
        const inventories = await InventoryService.getAllInventories(); 
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = inventories;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse)
    }catch(error) {
        console.log(error);
        ErrorResponse.message = "Something went wrong while getting Inventories";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}


module.exports = {
    addInventory,
    getInventory,
    getAllInventories
}