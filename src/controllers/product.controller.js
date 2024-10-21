const { StatusCodes } = require("http-status-codes");
const { ProductService, InventoryTransactionService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const AppError = require("../utils/errors/app.error");
const product = require("../models/product");
const { addInventoryTransaction } = require("./inventory_transaction.controller");
const moment = require('moment'); 
const currentTime = new Date().toLocaleString(); 

async function addProduct(req, res) {
    try {
        const { name, description, description_type, audio_path, category_id, quantity_type, stock, product_cost, product_image } = req.body;

        const existingProduct = await ProductService.getProductByNameAndCategory(name, category_id);

        if (existingProduct) {
            ErrorResponse.message = "Product with this name and category already exists.";
            return res.status(StatusCodes.CONFLICT).json(ErrorResponse); // 409 Conflict
        }

        const product = await ProductService.createProduct({
            name,
            description,
            description_type,
            audio_path,
            category_id,
            quantity_type,
            stock,
            product_cost,
            product_image 
        });
        const updatedInventory = await InventoryTransactionService.createInventoryTransaction({
            product_id: product.id,
            transaction_type: 'in',
            quantity: product.stock,  // Log the absolute value of quantity change
            quantity_type: product.quantity_type,
            description: `${product.name} added with quantity ${stock} at ${currentTime}`,
            description_type: 'text',
            audio_path: product.audio_path
        });

        SuccessResponse.message = "Product added successfully";
        SuccessResponse.data = { product, updatedInventory };
        return res.status(StatusCodes.CREATED).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.message = "Failed to add product.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}


async function getProduct(req, res) {
    try{
        const product = await ProductService.getProduct(req.params.productId);
        SuccessResponse.message = "Product fetched Successfully.";
        SuccessResponse.data = product;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    }catch(error){
        ErrorResponse.message = "Failed to fetch product.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

async function getProducts(req, res) {
    try {
        const products = await ProductService.getAllProducts();
        SuccessResponse.message = "Products retrieved successfully.";
        SuccessResponse.data = products;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.message = "Failed to fetch products.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

async function reduceProduct(req, res) {
    try {
        const productId = req.params.productId;
        const quantity = req.body.quantity;
        const product = await ProductService.getProduct(productId);
        
        if(!product) {
            ErrorResponse.message = "Product not found";
            return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }

        let changeStock = product.stock - quantity;
        console.log("changeStock", changeStock);
        
        if(changeStock < 0) {
            ErrorResponse.message = "Quantity provided would result in negative stock";
            return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }
        const updatedProduct = await ProductService.reduceProductByQuantity(productId, changeStock);
        
        const inventoryData = {
            product_id: productId,
            transaction_type: 'out',
            quantity: quantity,
            quantity_type: product.quantity_type,
            description: `Product reduced by quantity ${quantity} new quantity ${changeStock}, transaction type 'out' at time ${currentTime}`,
            description_type: 'text',
        };
    
        console.log("Inventory Data:", inventoryData);
        const logData = await InventoryTransactionService.createInventoryTransaction(inventoryData);
        
        SuccessResponse.message = "Product reduced successfully.";
        SuccessResponse.data = {updatedProduct, logData};
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.message = "Failed to remove products.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

// async function updateProductByQuantity(req, res) {
//     try {
//         const { quantity, transaction_type } = req.body; // Quantity can be positive or negative
//         const {productId} = req.params;
//         const product = await ProductService.getProduct(productId);

//         if (!product || quantity === 0) {
//             ErrorResponse.message = "Product not found or Quantity cannot be 0";
//             return res.status(StatusCodes.NOT_FOUND).json(ErrorResponse);
//         }

//         const currentStock = product.stock;

//         // Calculate the new stock after applying the quantity change
//         const newStock = (transaction_type==='in') ? currentStock + quantity : currentStock-quantity;

//         if (newStock < 0) {
//             // Prevent stock from going negative
//             ErrorResponse.message = "Quantity provided would result in negative stock";
//             return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
//         }

//         // Determine the transaction type and description
//         let description;

//         if (transaction_type==="in") {
//             // Stock is being increased
//             description = `Stock increased by ${quantity}, the stock now is ${newStock} on date: ${currentTime}`;
//         } else {
//             // Stock is being decreased
//             description = `Stock decreased by ${quantity}, the stock  now is ${newStock} on date: ${currentTime}`;
//         }

//         const updatedProduct = await ProductService.updateProduct(productId, newStock);

//         const updatedInventory = await InventoryTransactionService.createInventoryTransaction({
//             product_id: productId,
//             transaction_type,
//             quantity,  // Log the absolute value of quantity change
//             quantity_type: product.quantity_type,
//             description: description,
//             description_type: 'text'
//         });

//         SuccessResponse.message = "Product updated successfully.";
//         SuccessResponse.data = {updatedProduct, updatedInventory};
//         return res.status(StatusCodes.OK).json(SuccessResponse);
//     } catch (error) {
//         return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to update product', error });
//     }
// }

async function updateProductByQuantity(req, res) {
    // const transaction = await sequelize.transaction;  // Start transaction
    try {
        const { quantity, transaction_type } = req.body; // Quantity can be positive or negative
        const { productId } = req.params;

        // Perform product update and retrieve the updated product in one step
        const product = await ProductService.getProduct(productId);
        if (!product || quantity === 0) {
            // await transaction.rollback();
            ErrorResponse.message = "Product not found or Quantity cannot be 0";
            return res.status(StatusCodes.NOT_FOUND).json(ErrorResponse);
        }

        const currentStock = product.stock;
        const newStock = (transaction_type === 'in') ? currentStock + quantity : currentStock - quantity;

        if (newStock < 0) {
            // await transaction.rollback();  // Rollback if stock goes negative
            ErrorResponse.message = "Quantity provided would result in negative stock";
            return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }

        const currentTime = new Date().toLocaleString(); // Generate once for consistency

        const description = (transaction_type === 'in')
            ? `Stock increased by ${quantity}, stock now is ${newStock} on date: ${currentTime}`
            : `Stock decreased by ${quantity}, stock now is ${newStock} on date: ${currentTime}`;

        // Perform product stock update and inventory log within a transaction
        const [updatedProduct, updatedInventory] = await Promise.all([
            ProductService.updateProduct(productId, newStock),
            InventoryTransactionService.createInventoryTransaction({
                product_id: productId,
                transaction_type,
                quantity,
                quantity_type: product.quantity_type,
                description,
                description_type: 'text'
            })
        ]);

        // await transaction.commit();  // Commit transaction if all went well

        SuccessResponse.message = "Product updated successfully.";
        SuccessResponse.data = { updatedProduct, updatedInventory };
        return res.status(StatusCodes.OK).json(SuccessResponse);

    } catch (error) {
        // await transaction.rollback();  // Rollback transaction in case of error
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to update product', error });
    }
}


module.exports = {
    addProduct,
    getProducts,
    getProduct,
    reduceProduct,
    // updateProduct,
    updateProductByQuantity
}