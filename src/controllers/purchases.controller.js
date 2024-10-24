const { StatusCodes } = require("http-status-codes");
const { PurchaseService, ProductService, InventoryTransactionService, BalanceTransactionService, UserService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");


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

async function addPurchase(req, res) {
    try {
        // const user = req.user;
        const { name, product_id,description,description_type, category_id, quantity, product_cost, quantity_type, total_cost, payment_date, payment_status, payment_due_date, vendor_id, invoice_Bill } = req.body;
        const currentTime = new Date().toLocaleString(); 
        const product = await ProductService.getProductByNameAndCategory(name, category_id);
        
        let updatedProduct, newStock, updatedInventory, purchase, balance_trans;
        if(product) {
            newStock = product.stock + quantity;    
            updatedProduct = await ProductService.updateProduct(product_id, newStock);

            updatedInventory = await InventoryTransactionService.createInventoryTransaction({
                product_id: product.id,
                transaction_type: "in",
                quantity,
                quantity_type: product.quantity_type,
                description: `${product.name} was added quantity ${quantity}, total quantity ${newStock} on ${currentTime}.`,
                description_type: 'text'
            })

            updatedCost = product.product_cost * quantity;
            purchase = await PurchaseService.createPurchase({
                product_id: product.id,
                quantity,
                quantity_type,
                total_cost: updatedCost || total_cost,
                payment_date,
                payment_status,
                payment_due_date,
                vendor_id,
                invoice_Bill
            });
            
            balance_trans = await BalanceTransactionService.createBalanceTransactions({
                user_id: user.id,
                transaction_type: "expense",
                amount: updatedCost,
                source: "purchase",
                previous_balance: user.currentBalance,
                new_balance: user.currentBalance - updatedCost
            });

            user_data = await UserService.getUser(user.id);
            const currentBalance = user.currentBalance - updatedCost;
            update_user = await UserService.updateUserBalance(user.id, currentBalance);
            
        } else {
            // updatedProduct = await ProductService.createProduct({
            //     name,
            //     category_id,
            //     description,
            //     description_type,
            //     audio_path,
            //     category_id,
            //     quantity_type,
            //     stock: quantity,
            //     product_cost, // feed it in body necessary
            // });

            updatedProduct = await ProductService.createProduct({
                name,                // Name of the product
                category_id,         // ID of the category
                description,         // Product description
                description_type,    // Type of the description (text, audio, etc.)
                // audio_path,          // Path to an audio file (if applicable)
                quantity_type,       // The type of the quantity (e.g., kg, l, m, pcs)
                stock: quantity,     // Initial stock (from quantity in request)
                product_cost,        // Cost of the product per unit
                product_image: invoice_Bill        // Include the product image if required (if it's missing, ensure it is passed)
            });
        
            updatedInventory = await InventoryTransactionService.createInventoryTransaction({
                product_id: updatedProduct.id,
                transaction_type: 'in',
                quantity: updatedProduct.stock,  // Log the absolute value of quantity change
                quantity_type: updatedProduct.quantity_type,
                description: `${updatedProduct.name} added with quantity ${updatedProduct.stock} at ${currentTime}`,
                description_type: 'text',
                audio_path: updatedProduct.audio_path
            });

            updatedCost = updatedProduct.product_cost * updatedProduct.quantity;
            purchase = await PurchaseService.createPurchase({
                product_id: updatedProduct.id,
                quantity,
                quantity_type,
                total_cost: updatedCost || total_cost,
                payment_date,
                payment_status,
                payment_due_date,
                vendor_id,
                invoice_Bill
            });

            balance_trans = await BalanceTransactionService.createBalanceTransactions({
                user_id: user.id,
                transaction_type: "expense",
                amount: updatedCost,
                source: "purchase",
                previous_balance: user.currentBalance,
                new_balance: user.currentBalance - updatedCost
            });

            user_data = await UserService.getUser(user.id);
            const currentBalance = user.currentBalance - updatedCost;
            update_user = await UserService.updateUserBalance(user.id, currentBalance);
        }

        SuccessResponse.message = "Purchase added successfully";
        SuccessResponse.data = {purchase, updatedProduct, updatedInventory};
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