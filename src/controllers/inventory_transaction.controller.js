const { StatusCodes } = require("http-status-codes");
const { InventoryTransactionService, ProductService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const {Product} = require("../models");

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
        ErrorResponse.message = "Something went wrong while getting Inventory Transaction.";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}

async function getAllInventoryTransactions(req, res){
    try{
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit; 
        const search = req.query.search || '';
        const fields = req.query.fields ? req.query.fields.split(',') : [];
        const filter = req.query.filter || null;

        const { count, rows } = await InventoryTransactionService.getAllInventoryTransactions(limit, offset, search, fields, filter);

        SuccessResponse.message = "Inventory Tansactions retrieved successfully.";
        SuccessResponse.data = {
            products: rows,
            totalCount: count, 
            totalPages: Math.ceil(count / limit), 
            currentPage: page,
            pageSize: limit
        };
        return res.status(StatusCodes.OK).json(SuccessResponse);
    }catch(error) {
        console.log(error);
        ErrorResponse.message = "Something went wrong while getting Inventory Transactions.";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
}

async function getDamagedProductsData(req, res){
    try{
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit; 
        const search = req.query.search || '';
        const fields = req.query.fields ? req.query.fields.split(',') : [];
        const { count, rows } = await InventoryTransactionService.getDamagedProductsData(limit, offset, search, fields);
      
        // Fetch product names for each transaction based on product_id
        const productsWithNames = await Promise.all(
            rows.map(async (row) => {
                // Fetch the product name based on product_id
                const product = await Product.findByPk(row.product_id, {
                    attributes: ['name'], // Only fetch the `name` field
                });

                return {
                    ...row.toJSON(),
                    product_name: product ? product.name : null, // Include product name if found
                };
            })
        );
        SuccessResponse.message = "Damaged products data retrieved successfully.";
        SuccessResponse.data = {
            products: productsWithNames,
            totalCount: count, 
            totalPages: Math.ceil(count / limit), 
            currentPage: page,
            pageSize: limit
        };
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch(error){
        console.log(error);
        ErrorResponse.message = "Something went wrong while retrieving damaged product data.";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
}

async function getDamagedDataByDate(req, res){
    try{
        const date = req.body.date;
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit; 
        const search = req.query.search || '';
        const fields = req.query.fields ? req.query.fields.split(',') : [];
        const { count, rows } = await InventoryTransactionService.getDamagedDataByDate(date, limit, offset, search, fields);
         // Fetch product names for each transaction based on product_id
         const productsWithNames = await Promise.all(
            rows.map(async (row) => {
                // Fetch the product name based on product_id
                const product = await Product.findByPk(row.product_id, {
                    attributes: ['name'], // Only fetch the `name` field
                });

                return {
                    ...row.toJSON(),
                    product_name: product ? product.name : null, // Include product name if found
                };
            })
        );
        SuccessResponse.message = "Damaged products data retrieved successfully.";
        SuccessResponse.data = {
            products: productsWithNames,
            totalCount: count, 
            totalPages: Math.ceil(count / limit), 
            currentPage: page,
            pageSize: limit
        };
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch(error){
        console.log(error);
        ErrorResponse.message = "Something went wrong while retrieving damaged product data.";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
}


module.exports = {
    addInventoryTransaction,
    getAllInventoryTransactions,
    getInventoryTransaction,
    getDamagedProductsData,
    getDamagedDataByDate
}