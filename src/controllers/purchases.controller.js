const { StatusCodes } = require("http-status-codes");
const { PurchaseService, ProductService, InventoryTransactionService, BalanceTransactionService, UserService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const AppError = require("../utils/errors/app.error");
const { sequelize } = require("../models");
const { Product, Vendors } = require("../models");

async function addPurchase(req, res) {
    
    const transaction = await sequelize.transaction();
    
    try {
        const user_id = req.user.id;
        const { 
            products,  // Array of products with id, quantity, price
            payment_date, 
            payment_status, 
            payment_due_date, 
            vendor_id, 
            // invoice_Bill 
        } = req.body;

        let invoiceBill = req.file ? `/uploads/images/${req.file.filename}`: null;
        // console.log("invoiceBill", invoiceBill);
        
        
        const currentTime = new Date().toLocaleString();
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
            const productId = Number(product.id);
            const quantity = Number(product.quantity);
            const price = Number(product.price);
            const existingProduct = productMap.get(productId);
            
            if (!existingProduct) {
                throw new AppError(`Product with ID ${productId} not found`, StatusCodes.NOT_FOUND);
            }

            const productCost = price * quantity;
            totalCost += productCost;

            // Prepare updates
            const newStock = Number(existingProduct.stock) + quantity;
            
            updates.push({
                id: productId,
                newStock: newStock
            });

            // Prepare inventory transactions
            inventoryTransactions.push({
                product_id: productId,
                transaction_type: "in",
                quantity: quantity,
                quantity_type: existingProduct.quantity_type,
                // description: `${existingProduct.name} was added quantity ${product.quantity}, total quantity ${newStock} on ${currentTime}.`,
                description: `${existingProduct.name}`,
                description_type: 'text',
                isManufactured: false
            });

            // Prepare purchase records
            purchaseRecords.push({
                product_id: productId,
                quantity: quantity,
                quantity_type: existingProduct.quantity_type,
                total_cost: productCost,
                payment_date,
                payment_status,
                payment_due_date,
                vendor_id,
                invoice_Bill: invoiceBill
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
        console.log(error);
        await transaction.rollback();
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

async function getAllPurchases(req, res) {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit; 
        const search = req.query.search || '';
        const fields = req.query.fields ? req.query.fields.split(',') : [];
        const filter = req.query.filter || null;

        const { count, rows } = await PurchaseService.getAllPurchases(limit, offset, search, fields, filter);
        const withNames = await Promise.all(
            rows.map(async (row) => {
                // Fetch the product name based on product_id
                const product = await Product.findByPk(row.product_id, {
                    attributes: ['name'], // Only fetch the `name` field
                });

                const vendor = await Vendors.findByPk(row.vendor_id, {
                    attributes: ['name'], // Only fetch the `name` field
                })

                return {
                    ...row.toJSON(),
                    product_name: product ? product.name : null, // Include product name if found
                    vendor_name: vendor ? vendor.name : null, // Include product name if found
                };
            })
        );

        SuccessResponse.message = "Purchases retrieved successfully.";
        SuccessResponse.data = {
            purchases: withNames,
            totalCount: count, 
            totalPages: Math.ceil(count / limit), 
            currentPage: page,
            pageSize: limit
        };
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        console.log(error);
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
        const date = new Date();

        const { count, rows } = await PurchaseService.getPurchasesByDate(date, limit, offset, search, fields); 
        // Fetch product names for each transaction based on product_id
        const withNames = await Promise.all(
            rows.map(async (row) => {
                // Fetch the product name based on product_id
                const product = await Product.findByPk(row.product_id, {
                    attributes: ['name'], // Only fetch the `name` field
                });

                const vendor = await Vendors.findByPk(row.vendor_id, {
                    attributes: ['name'], // Only fetch the `name` field
                })

                return {
                    ...row.toJSON(),
                    product_name: product ? product.name : null, // Include product name if found
                    vendor_name: vendor ? vendor.name : null, // Include product name if found
                };
            })
        );

        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = {
            purchases: withNames,
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

        const withNames = await Promise.all(
            rows.map(async (row) => {
                // Fetch the product name based on product_id
                const product = await Product.findByPk(row.product_id, {
                    attributes: ['name'], // Only fetch the `name` field
                });

                const vendor = await Vendors.findByPk(row.vendor_id, {
                    attributes: ['name'], // Only fetch the `name` field
                })

                return {
                    ...row.toJSON(),
                    product_name: product ? product.name : null, // Include product name if found
                    vendor_name: vendor ? vendor.name : null, // Include product name if found
                };
            })
        );
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = {
            purchases: withNames,
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

async function getUnPaidPurchases(req, res){
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit; 
        const search = req.query.search || '';
        const fields = req.query.fields ? req.query.fields.split(',') : [];    
        const { count, rows } = await PurchaseService.getUnPaidPurchases(limit, offset, search, fields); 

        const withNames = await Promise.all(
            rows.map(async (row) => {
                // Fetch the product name based on product_id
                const product = await Product.findByPk(row.product_id, {
                    attributes: ['name'], // Only fetch the `name` field
                });

                const vendor = await Vendors.findByPk(row.vendor_id, {
                    attributes: ['name'], // Only fetch the `name` field
                })

                return {
                    ...row.toJSON(),
                    product_name: product ? product.name : null, // Include product name if found
                    vendor_name: vendor ? vendor.name : null, // Include product name if found
                };
            })
        );

        SuccessResponse.message = "Unpaid/Partially Paid data retrieved successfully.";
        SuccessResponse.data = {
            purchases: withNames,
            totalCount: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            pageSize: limit
          }
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse)
    } catch (error) {
        console.log(error);
        ErrorResponse.message = "Something went wrong while getting Unpaid/partial paid purchases.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse)
    }
}


module.exports = {
    addPurchase,
    getPurchase,
    getAllPurchases,
    getTodayPurchases,
    getPurchasesByDate,
    getUnPaidPurchases
}