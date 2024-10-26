const { StatusCodes } = require("http-status-codes");
const { PurchaseService, ProductService, InventoryTransactionService, BalanceTransactionService, UserService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const AppError = require("../utils/errors/app.error");
const { sequelize } = require("../models");


// For existing product the needed body elements please create form matching this.
// {
//     "name": "Product K",
//     "product_id": 13,
//     // "description": "",
//     "description_type": "text",
//     "category_id": 2, 
//     "quantity": 20,
//     "product_cost": 40,
//     "quantity_type": "kg", 
//     // "total_cost": 8000, 
//     "payment_date": "2024-10-21",
//     "payment_status": "paid",
//     // "payment_due_date": "",
//     "vendor_id": 1, 
//     "invoice_Bill":"path.jpg"
// }

// async function addPurchase(req, res) {
   
//         // const user = req.user;
//         const { name,user_id, product_id,description,description_type, category_id, quantity, product_cost, quantity_type, total_cost, payment_date, payment_status, payment_due_date, vendor_id, invoice_Bill } = req.body;
//         const currentTime = new Date().toLocaleString(); 
//         const product = await ProductService.getProductByNameAndCategory(name, category_id);
//         // console.log("product",product);
        
//         if(!product){
//             throw new AppError("Product not found", StatusCodes.NOT_FOUND);
//         }
        
//         const transaction = await sequelize.transaction();
//         try {
//         const newStock = Number(product.stock) + Number(quantity);    
//         const updateProductPromise = await ProductService.updateProduct(product_id, newStock, {transaction});
    
//         const upInvenTranPromise = await InventoryTransactionService.createInventoryTransaction({
//             product_id: product.id,
//             transaction_type: "in",
//             quantity,
//             quantity_type: product.quantity_type,
//             description: `${product.name} was added quantity ${quantity}, total quantity ${newStock} on ${currentTime}.`,
//             description_type: 'text'
//         }, { transaction })

//         const updatedCost = Number(product.product_cost) * Number(quantity);
//         console.log("updated cost", updatedCost);
        
//         const createPurchasePromise = await PurchaseService.createPurchase({
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
            
//         // {
//         //     "user_id": 1,
//         //     "transaction_type": "income",
//         //     "amount": 10000,
//         //     "source": "invoice",
//         //     "previous_balance": 0,
//         //     "new_balance": 10000
//         // } 
//          const user_data = await UserService.getUser(user_id);
//         const balance_transPromise = await BalanceTransactionService.createBalanceTransactions({
//             user_id,
//             transaction_type: "expense",
//             amount: updatedCost || total_cost,
//             source: "purchase",
//             previous_balance: user_data.currentBalance,
//             new_balance: Number(user_data.currentBalance) - Number(updatedCost)
//         }, { transaction });

       
//         const currentBalance = Number(user_data.currentBalance) - Number(updatedCost);
//         const userPromise = await UserService.updateUserBalance(user_id, currentBalance, {transaction});

//         const [updatedProduct, updatedInventory, purchase, balance_trans, user_dat] = await Promise.all([
//             updateProductPromise,
//             upInvenTranPromise,
//             createPurchasePromise,
//             balance_transPromise,
//             userPromise
//         ]);

//         await transaction.commit();
    
//         SuccessResponse.message = "Purchase added successfully";
//         SuccessResponse.data = {purchase, updatedProduct, updatedInventory, balance_trans,user_dat};
//         return res.status(StatusCodes.OK).json(SuccessResponse);
//     } catch (error) {
//         await transaction.rollback();
//         ErrorResponse.message = "Failed to add purchase.";
//         ErrorResponse.error = error;
//         return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
//     }

// }

async function addPurchase(req, res) {
    const { name, user_id, product_id, category_id, quantity, quantity_type, total_cost, payment_date, payment_status, payment_due_date, vendor_id, invoice_Bill } = req.body;
    const currentTime = new Date().toLocaleString();

    const transaction = await sequelize.transaction();
    try {
        const product = await ProductService.getProductByNameAndCategory(name, category_id, { transaction });
        if (!product) {
            throw new AppError("Product not found", StatusCodes.NOT_FOUND);
        }
        const user = await UserService.getUser(user_id, { transaction });
        console.log("users", user.current_balance);
        
        if(!user){
            throw new AppError("User not found", StatusCodes.NOT_FOUND);
        }

        const newStock = Number(product.stock) + Number(quantity);
        // Convert current balance and updated cost to numbers
        const currentBalance = Number(user.current_balance);
        const updatedCost = Number(product.product_cost) * Number(quantity);
        const newBalance = currentBalance - updatedCost;

        console.log("User current balance:", currentBalance);
        console.log("Updated cost:", updatedCost);
        console.log("New balance:", newBalance);

        // No await here; let Promise.all handle concurrency.
        const updateProductPromise = ProductService.updateProduct(product_id, newStock, { transaction });
        const upInvenTranPromise = InventoryTransactionService.createInventoryTransaction({
            product_id: product.id,
            transaction_type: "in",
            quantity,
            quantity_type: product.quantity_type,
            description: `${product.name} was added quantity ${quantity}, total quantity ${newStock} on ${currentTime}.`,
            description_type: 'text'
        }, { transaction });

        const createPurchasePromise = PurchaseService.createPurchase({
            product_id: product.id,
            quantity,
            quantity_type,
            total_cost: updatedCost || total_cost,
            payment_date,
            payment_status,
            payment_due_date,
            vendor_id,
            invoice_Bill
        }, { transaction });

        const balance_transPromise = BalanceTransactionService.createBalanceTransactions({
            user_id:user.id,
            transaction_type: "expense",
            amount: updatedCost || total_cost,
            source: "purchase",
            previous_balance: user.current_balance,
            new_balance: newBalance
        }, { transaction });

        const userPromise = UserService.updateUserBalance(user_id, newBalance, { transaction });

        // Execute all promises concurrently
        const [updatedProduct, updatedInventory, purchase, balance_trans, updatedUser] = await Promise.all([
            updateProductPromise,
            upInvenTranPromise,
            createPurchasePromise,
            balance_transPromise,
            userPromise
        ]);

        await transaction.commit();

        SuccessResponse.message = "Purchase added successfully";
        SuccessResponse.data = { purchase, updatedProduct, updatedInventory, balance_trans, updatedUser };
        return res.status(StatusCodes.OK).json(SuccessResponse);

    } catch (error) {
        await transaction.rollback();
        console.error("Transaction failed:", error); // Improved error logging
        ErrorResponse.message = "Failed to add purchase.";
        ErrorResponse.error = error.message || error;
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

async function getTodayPurchases(req, res){
    try{  
        const purchases = await PurchaseService.getTodayPurchases(); 
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

async function getPurchasesByDate(req, res){
    try{
        const date = new Date(req.body.date);
        console.log("Controller date", date);       
        const purchases = await PurchaseService.getPurchasesByDate(date); 
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
    getAllPurchases,
    getTodayPurchases,
    getPurchasesByDate
}