const { StatusCodes } = require("http-status-codes");
const { PurchaseService, ProductService, InventoryTransactionService, BalanceTransactionService, UserService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const AppError = require("../utils/errors/app.error");
const { sequelize } = require("../models");


// async function addPurchase(req, res) {
//     const { name, user_id, product_id, category_id, quantity, quantity_type, total_cost, payment_date, payment_status, payment_due_date, vendor_id, invoice_Bill } = req.body;
//     const currentTime = new Date().toLocaleString();

//     const transaction = await sequelize.transaction();
//     try {
//         const product = await ProductService.getProductByNameAndCategory(name, category_id, { transaction });
//         if (!product) {
//             throw new AppError("Product not found", StatusCodes.NOT_FOUND);
//         }
//         const user = await UserService.getUser(user_id, { transaction });
//         console.log("users", user.current_balance);
        
//         if(!user){
//             throw new AppError("User not found", StatusCodes.NOT_FOUND);
//         }

//         const newStock = Number(product.stock) + Number(quantity);
//         // Convert current balance and updated cost to numbers
//         const currentBalance = Number(user.current_balance);
//         const updatedCost = Number(product.product_cost) * Number(quantity);
//         const newBalance = currentBalance - updatedCost;

//         console.log("User current balance:", currentBalance);
//         console.log("Updated cost:", updatedCost);
//         console.log("New balance:", newBalance);

//         // No await here; let Promise.all handle concurrency.
//         const updateProductPromise = ProductService.updateProduct(product_id, newStock, { transaction });
//         const upInvenTranPromise = InventoryTransactionService.createInventoryTransaction({
//             product_id: product.id,
//             transaction_type: "in",
//             quantity,
//             quantity_type: product.quantity_type,
//             description: `${product.name} was added quantity ${quantity}, total quantity ${newStock} on ${currentTime}.`,
//             description_type: 'text'
//         }, { transaction });

//         const createPurchasePromise = PurchaseService.createPurchase({
//             product_id: product.id,
//             quantity,
//             quantity_type,
//             total_cost: updatedCost || total_cost,
//             payment_date,
//             payment_status,
//             payment_due_date,
//             vendor_id,
//             invoice_Bill
//         }, { transaction });

//         const balance_transPromise = BalanceTransactionService.createBalanceTransactions({
//             user_id:user.id,
//             transaction_type: "expense",
//             amount: updatedCost || total_cost,
//             source: "purchase",
//             previous_balance: user.current_balance,
//             new_balance: newBalance
//         }, { transaction });

//         const userPromise = UserService.updateUserBalance(user_id, newBalance, { transaction });

//         // Execute all promises concurrently
//         const [updatedProduct, updatedInventory, purchase, balance_trans, updatedUser] = await Promise.all([
//             updateProductPromise,
//             upInvenTranPromise,
//             createPurchasePromise,
//             balance_transPromise,
//             userPromise
//         ]);

//         await transaction.commit();

//         SuccessResponse.message = "Purchase added successfully";
//         SuccessResponse.data = { purchase, updatedProduct, updatedInventory, balance_trans, updatedUser };
//         return res.status(StatusCodes.OK).json(SuccessResponse);

//     } catch (error) {
//         await transaction.rollback();
//         console.error("Transaction failed:", error); // Improved error logging
//         ErrorResponse.message = "Failed to add purchase.";
//         ErrorResponse.error = error.message || error;
//         return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
//     }
// }


async function addPurchase(req, res) {
    const user_id = req.user.id;
    const { 
        // user_id,  removed from body to access from req
        products,  // Array of products with id, quantity, price
        payment_date, 
        payment_status, 
        payment_due_date, 
        vendor_id, 
        invoice_Bill 
    } = req.body;
    
    const currentTime = new Date().toLocaleString();
    const transaction = await sequelize.transaction();

    try {
        // Validate input
        if (!Array.isArray(products) || products.length === 0) {
            throw new AppError("Products array is required", StatusCodes.BAD_REQUEST);
        }

        // Get user
        const user = await UserService.getUser(user_id, { transaction });
        if (!user) {
            throw new AppError("User not found", StatusCodes.NOT_FOUND);
        }

        // Get all product IDs
        const productIds = products.map(p => p.id);
        
        // Fetch all products in one query
        const existingProducts = await ProductService.getProductsByIds(productIds, { transaction });
        const productMap = new Map(existingProducts.map(p => [p.id, p]));

        // Calculate total cost and validate products
        let totalCost = 0;
        const updates = [];
        const inventoryTransactions = [];
        const purchaseRecords = [];

        for (const product of products) {
            const existingProduct = productMap.get(product.id);
            
            if (!existingProduct) {
                throw new AppError(`Product with ID ${product.id} not found`, StatusCodes.NOT_FOUND);
            }

            const productCost = Number(product.price) * Number(product.quantity);
            totalCost += productCost;

            // Prepare updates
            const newStock = Number(existingProduct.stock) + Number(product.quantity);
            
            updates.push({
                id: product.id,
                newStock: newStock
            });

            // Prepare inventory transactions
            inventoryTransactions.push({
                product_id: product.id,
                transaction_type: "in",
                quantity: product.quantity,
                quantity_type: existingProduct.quantity_type,
                description: `${existingProduct.name} was added quantity ${product.quantity}, total quantity ${newStock} on ${currentTime}.`,
                description_type: 'text'
            });

            // Prepare purchase records
            purchaseRecords.push({
                product_id: product.id,
                quantity: product.quantity,
                quantity_type: existingProduct.quantity_type,
                total_cost: productCost,
                payment_date,
                payment_status,
                payment_due_date,
                vendor_id,
                invoice_Bill
            });
        }

        // Calculate new balance
        const currentBalance = Number(user.current_balance);
        const newBalance = currentBalance - totalCost;

        // Execute all updates concurrently
        const [
            updatedProducts,
            inventoryRecords,
            purchaseEntries,
            balanceTransaction,
            updatedUser
        ] = await Promise.all([
            // Update all products
            Promise.all(updates.map(update => 
                ProductService.updateProduct(update.id, update.newStock, { transaction })
            )),

            // Create all inventory transactions
            Promise.all(inventoryTransactions.map(record =>
                InventoryTransactionService.createInventoryTransaction(record, { transaction })
            )),

            // Create all purchase records
            Promise.all(purchaseRecords.map(record =>
                PurchaseService.createPurchase(record, { transaction })
            )),

            // Create balance transaction
            BalanceTransactionService.createBalanceTransactions({
                user_id: user.id,
                transaction_type: "expense",
                amount: totalCost,
                source: "purchase",
                previous_balance: currentBalance,
                new_balance: newBalance
            }, { transaction }),

            // Update user balance
            UserService.updateUserBalance(user_id, newBalance, { transaction })
        ]);

        await transaction.commit();

        SuccessResponse.message = "Purchase added successfully";
        SuccessResponse.data = {
            purchases: purchaseEntries,
            updatedProducts,
            inventoryTransactions: inventoryRecords,
            balanceTransaction,
            updatedUser
        };
        return res.status(StatusCodes.OK).json(SuccessResponse);

    } catch (error) {
        await transaction.rollback();
        console.error("Transaction failed:", error);
        ErrorResponse.message = "Failed to add purchase.";
        ErrorResponse.error = error.message || error;
        return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
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

// async function getAllPurchases(req, res){
//     try{
//         const purchases = await PurchaseService.getAllPurchases(); 
//         SuccessResponse.message = "Successfully completed the request";
//         SuccessResponse.data = purchases;
//         return res
//             .status(StatusCodes.OK)
//             .json(SuccessResponse)
//     }catch(error) {
//         console.log(error);
//         ErrorResponse.message = "Something went wrong while getting Purchases";
//         ErrorResponse.error = error;
//         return res
//             .status(StatusCodes.INTERNAL_SERVER_ERROR)
//             .json(ErrorResponse)
//     }
// }

async function getAllPurchases(req, res) {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit; 
        const search = req.query.search || '';
        const fields = req.query.fields ? req.query.fields.split(',') : [];

        const { count, rows } = await PurchaseService.getAllPurchases(limit, offset, search);

        SuccessResponse.message = "Purchases retrieved successfully.";
        SuccessResponse.data = {
            purchases: rows,
            totalCount: count, 
            totalPages: Math.ceil(count / limit), 
            currentPage: page,
            pageSize: limit
        };
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.message = "Failed to fetch purchases.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

async function getTodayPurchases(req, res){
    try{  
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit; 
        const search = req.query.search || '';
        const fields = req.query.fields ? req.query.fields.split(',') : [];

        const { count, rows } = await PurchaseService.getTodayPurchases(limit, offset, search); 
        SuccessResponse.message = "Successfully completed the request";
        // SuccessResponse.data = purchases;
        SuccessResponse.data = {
            purchases: rows,
            totalCount: count, 
            totalPages: Math.ceil(count / limit), 
            currentPage: page,
            pageSize: limit
        };
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

async function getPurchasesByDate(req, res){
    try{
        const date = new Date(req.body.date);
        console.log("Controller date", date);   
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit; 
        const search = req.query.search || '';
        const fields = req.query.fields ? req.query.fields.split(',') : [];    
        const { count, rows } = await PurchaseService.getPurchasesByDate(date, limit, offset, search, fields); 
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = {
            purchases: rows,
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
    getAllPurchases,
    getTodayPurchases,
    getPurchasesByDate
}