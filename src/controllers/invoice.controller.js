const { StatusCodes } = require("http-status-codes");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { findStateByPincode } = require('../../src/utils/common/pincodehelper');
const { InvoiceService, InventoryTransactionService, BalanceTransactionService, UserService, ProductService, } = require('../services');
const AppError = require("../utils/errors/app.error");
const { sequelize } = require("../models");

// async function addInvoice(req, res) {
//     try {
//         const {  
//             customer_id,
//             due_date,
//             due_amount,
//             payment_status,
//             payment_method,
//             pincode,
//             address,
//             mobile,
//             items
//         } = req.body;

//         const state = findStateByPincode(pincode);
//         if(!state){
//             throw new AppError(['Invalid Pincode provided ${pincode}.'], StatusCodes.BAD_REQUEST);
//         }

//         const invoice = await InvoiceService.createInvoice({
//             customer_id, due_date, due_amount, payment_status, payment_method, pincode, address, mobile,
//         });

//         let totalAmount = 0;
//         let totalTax = 0;

//         const invoiceItems = await Promise.all(
//             items.map(async (item) => {
//                 const itemData = await Invoice_ItemService.getInvoiceItem(item.id);
//                 if (!itemData) {
//                     throw new AppError([`Invoice item with ID ${item.id} not found.`], StatusCodes.BAD_REQUEST);
//                 }

//                 if (item.quantity > itemData.quantity) {
//                     throw new AppError([`Requested quantity (${item.quantity}) exceeds available quantity (${itemData.quantity}) for item ID ${item.id}.`], StatusCodes.BAD_REQUEST);
//                 }

//                 const itemTotal = itemData.unit_price * item.quantity;
//                 let taxAmount = 0;

//                  if (payment_method !== 'cash') {
//                     if (state.toLowerCase() === 'rajasthan') {
 
//                         const cgst = (itemTotal * itemData.cgst_rate) / 100;
//                         const sgst = (itemTotal * itemData.sgst_rate) / 100;
//                         taxAmount = cgst + sgst;
//                     } else {
 
//                         const igst = (itemTotal * itemData.igst_rate) / 100;
//                         taxAmount = igst;
//                     }
//                 }

//                 totalAmount += itemTotal;
//                 totalTax += taxAmount;

//                  return itemData;
//             })
//         );

//         await Promise.all(
//             items.map(async (item) => {
//                 const itemData = invoiceItems.find(data => data.id === item.id);
//                 const newQuantity = itemData.quantity - item.quantity;

//                 await Invoice_ItemService.updateInvoiceItem(item.id, { quantity: newQuantity });
//             })
//         );

//         invoice.total_amount = totalAmount + totalTax; 
//         invoice.total_tax = totalTax; 
//         invoice.items = items;
//         invoice.item_count = items.length;
//         await invoice.save();

        

//         SuccessResponse.message = "Invoice added successfully";
//         SuccessResponse.data = { invoice };
//         return res.status(StatusCodes.OK).json(SuccessResponse);
//     } catch (error) {
//         ErrorResponse.message = "Failed to add Invoice.";
//         ErrorResponse.error = error;
//         return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
//     }
// }



// async function addInvoice(req, res) {
//         const {  
//             customer_id,
//             due_date,
//             due_amount,
//             payment_status,
//             payment_method,
//             pincode,
//             address,
//             mobile,
//             products
//         } = req.body;
//         // console.log(req.body);
//         const state = findStateByPincode(pincode);
//         // console.log("state", state);
//         if(!state) {
//             throw new AppError(`Invalid Pincode provided ${pincode}.`, StatusCodes.BAD_REQUEST);
//         }
//         // console.log("State",state);

//         const transaction = await sequelize.transaction();

//         try {
//             const invoice = await InvoiceService.createInvoice({
//                 customer_id, 
//                 due_date, 
//                 due_amount, 
//                 payment_status, 
//                 payment_method, 
//                 pincode, 
//                 address, 
//                 mobile
//             }, { transaction });
//             console.log("Invoice: ", invoice);
            
//             let totalAmount = 0;
//             let totalTax = 0;
//             const currentTime = new Date().toISOString();
//             const inventoryTransactions = [];

//             // Process each product
//             const processedProducts = await Promise.all(
//                 products.map(async (item) => {
//                     const product = await ProductService.getProduct(item.product_id);
//                     if (!product) {
//                         throw new AppError(`Product with ID ${item.product_id} not found.`, StatusCodes.BAD_REQUEST);
//                     }

//                     if (item.quantity > product.stock) {
//                         throw new AppError(`Requested quantity (${item.quantity}) exceeds available quantity (${product.stock}) for product ID ${item.product_id}.`, StatusCodes.BAD_REQUEST);
//                     }

//                     const itemTotal = item.price * item.quantity;
//                     let taxAmount = 0;

//                     if (payment_method !== 'cash') {
//                         if (state.toLowerCase() === 'rajasthan') {
//                             const cgst = (itemTotal * product.cgst_rate) / 100;
//                             const sgst = (itemTotal * product.sgst_rate) / 100;
//                             taxAmount = cgst + sgst;
//                         } else {
//                             const igst = (itemTotal * product.igst_rate) / 100;
//                             taxAmount = igst;
//                         }
//                     }

//                     totalAmount += itemTotal;
//                     totalTax += taxAmount;

//                     // Update product quantity
//                     const newStock = product.stock - item.quantity;
//                     await ProductService.updateProduct(
//                         item.product_id, 
//                         newStock,
//                         { transaction }
//                     );

//                     // Add to inventory transactions array
//                     inventoryTransactions.push({
//                         product_id: product.id,
//                         transaction_type: "out",
//                         quantity: item.quantity,
//                         quantity_type: product.quantity_type,
//                         description: `${product.name} was deducted quantity ${item.quantity}, total quantity ${newStock} on ${currentTime}.`,
//                         description_type: 'text'
//                     });

//                     return {
//                         product_id: item.product_id,
//                         quantity: item.quantity,
//                         unit_price: item.price,
//                         tax_amount: taxAmount,
//                         total: itemTotal + taxAmount
//                     };
//                 })
//             );

//             // Create all inventory transactions
//             await Promise.all(
//                 inventoryTransactions.map(inventoryTx => 
//                     InventoryTransactionService.createInventoryTransaction(inventoryTx, { transaction })
//                 )
//             );

//             // Update invoice with totals
//             invoice.total_amount = totalAmount + totalTax;
//             invoice.total_tax = totalTax;
//             invoice.products = processedProducts;
//             invoice.item_count = products.length;
//             await invoice.save({ transaction });
//             console.log("invoice data", invoice);

//             // Get current user balance
//             const user = await UserService.getUser(user.id);
//             const currentBalance = user.current_balance;
//             const newBalance = currentBalance + invoice.total_amount;

//             // Create balance transaction
//             await BalanceTransactionService.createBalanceTransactions({
//                 user_id: user.id,
//                 transaction_type: "income",
//                 amount: invoice.total_amount,
//                 source: "invoice",
//                 previous_balance: currentBalance,
//                 new_balance: newBalance
//             }, { transaction });

//             // Update user balance
//             await UserService.updateUserBalance(
//                 user.id, 
//                 newBalance, 
//                 { transaction }
//             );

//             await transaction.commit();

//             SuccessResponse.message = "Invoice added successfully";
//             SuccessResponse.data = { invoice };
//             return res.status(StatusCodes.OK).json(SuccessResponse);
//     } catch (error) {
//         await transaction.rollback();
//         ErrorResponse.message = "Failed to add Invoice.";
//         ErrorResponse.error = error;
//         return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
//     }
// }


async function addInvoice(req, res) {
    const user_id = req.user.id;
    const {  
        customer_id, // removed user_id
        due_date,
        due_amount,
        payment_status,
        payment_method,
        pincode,
        address,
        mobile,
        products
    } = req.body;

    const state = findStateByPincode(pincode);
    if(!state) {
        throw new AppError(`Invalid Pincode provided ${pincode}.`, StatusCodes.BAD_REQUEST);
    }

    const transaction = await sequelize.transaction();

    try {
        const invoice = await InvoiceService.createInvoice({
            customer_id, 
            due_date, 
            due_amount, 
            payment_status, 
            payment_method, 
            pincode, 
            address, 
            mobile,
            total_amount: 0,
            total_tax: 0
        }, { transaction });
        
        let totalAmount = 0;
        let totalTax = 0;
        const currentTime = new Date().toISOString();
        const inventoryTransactions = [];
        const invoiceProducts = [];

        // Process each product
        const processedProducts = await Promise.all(
            products.map(async (item) => {
                const product = await ProductService.getProduct(item.product_id);
                if (!product) {
                    throw new AppError(`Product with ID ${item.product_id} not found.`, StatusCodes.BAD_REQUEST);
                }

                if (item.quantity > product.stock) {
                    throw new AppError(`Requested quantity (${item.quantity}) exceeds available quantity (${product.stock}) for product ID ${item.product_id}.`, StatusCodes.BAD_REQUEST);
                }

                const itemTotal = item.price * item.quantity;
                let taxAmount = 0;
                let cgst = 0;
                let sgst = 0;
                let igst = 0;

                 // Check if tax rates exist in product
                 const cgstRate = product.cgst_rate;
                 const sgstRate = product.sgst_rate;
                 const igstRate = product.igst_rate;

                if (payment_method.toLowerCase() !== 'cash') {
                    
                    if (state.toLowerCase() === 'rajasthan') {
                        cgst = (itemTotal * cgstRate) / 100;
                        sgst = (itemTotal * sgstRate) / 100;
                        taxAmount = cgst + sgst;
                    } else {
                        igst = (itemTotal * igstRate) / 100;
                        taxAmount = igst;
                    }
                }

                totalAmount += itemTotal;
                totalTax += taxAmount;

                // Update product quantity
                const newStock = product.stock - item.quantity;
                await ProductService.updateProduct(
                    item.product_id, 
                    newStock,
                    { transaction }
                );

                // Add to inventory transactions array
                inventoryTransactions.push({
                    product_id: product.id,
                    transaction_type: "out",
                    quantity: item.quantity,
                    quantity_type: product.quantity_type,
                    // show only name
                    description: `${product.name}`,
                    description_type: 'text'
                });

                // Create invoice product object with tax details
                const invoiceProduct = {
                    invoice_id: invoice.id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: item.price,
                    cgst_amount: cgst,
                    sgst_amount: sgst,
                    igst_amount: igst,
                    tax_amount: taxAmount,
                    total: itemTotal + taxAmount
                };
                invoiceProducts.push(invoiceProduct);

                return invoiceProduct;
            })
        );

        // Create invoice products
        // if (invoiceProducts.length > 0) {
        //     await InvoiceProductService.createInvoiceProducts(invoiceProducts, { transaction });
        // }

        // Create all inventory transactions
        await Promise.all(
            inventoryTransactions.map(inventoryTx => 
                InventoryTransactionService.createInventoryTransaction(inventoryTx, { transaction })
            )
        );

        // Update invoice with totals
        await invoice.update({
            total_amount: totalAmount + totalTax,
            total_tax: totalTax,
            item_count: products.length
        }, { transaction });

        // Get current user balance
        const user = await UserService.getUser(user_id); 
        const currentBalance = Number(user.current_balance) || 0;
        const newBalance = currentBalance + invoice.total_amount;

        // Create balance transaction
        await BalanceTransactionService.createBalanceTransactions({
            user_id: user.id, // Fixed: changed user.id to customer_id
            transaction_type: "income",
            amount: invoice.total_amount,
            source: "invoice",
            previous_balance: currentBalance,
            new_balance: newBalance
        }, { transaction });

        // Update user balance
        await UserService.updateUserBalance(
            user_id, // Fixed: changed user.id to customer_id
            newBalance, 
            { transaction }
        );

        await transaction.commit();

        // Fetch complete invoice with all related data
        // const completeInvoice = await InvoiceService.getInvoiceById(invoice.id, {
        //     include: ['customer', 'products']
        // });
        const completeInvoice = await InvoiceService.getInvoice(invoice.id);

        SuccessResponse.message = "Invoice added successfully";
        SuccessResponse.data = { invoice: completeInvoice };
        return res.status(StatusCodes.OK).json(SuccessResponse);

    } catch (error) {
        await transaction.rollback();
        ErrorResponse.message = "Failed to add Invoice.";
        ErrorResponse.error = error;
        return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

async function getInvoice(req,res){
    try{
        const invoice = await InvoiceService.getInvoice(req.params.invoiceId);
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = invoice;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse) 
    } catch (error) {
        ErrorResponse.message = "Something went wrong while getting Invoice.";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}

async function getAllInvoices(req, res){
    try{
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit; 
        const search = req.query.search || '';
        const fields = req.query.fields ? req.query.fields.split(',') : [];

        const { count, rows } = await InvoiceService.getAllInvoices(limit, offset, search, fields);

        SuccessResponse.message = "Invoices retrieved successfully.";
        SuccessResponse.data = {
            products: rows,
            totalCount: count, 
            totalPages: Math.ceil(count / limit), 
            currentPage: page,
            pageSize: limit
        };
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse)
    }catch(error) {
        ErrorResponse.message = "Failed to fetch Invoices";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}

async function getPendingInvoices(req,res){
    try{
        const invoices = await InvoiceService.getPendingInvoices();
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = invoices;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse) 
    } catch (error) {
        ErrorResponse.message = "Something went wrong while getting Invoice.";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}

async function getTodayInvoices(req, res){
    try{    
        const invoices = await InvoiceService.getTodayInvoices(); 
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = invoices;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse)
    }catch(error) {
        ErrorResponse.message = "Something went wrong while getting Invoices.";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}

async function getInvoicesByDate(req, res) {
    try {
        const date = new Date(req.body.date);  
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit; 
        const search = req.query.search || '';
        const fields = req.query.fields ? req.query.fields.split(',') : [];    
        const { count, rows } = await InvoiceService.getInvoicesByDate(date, limit, offset, search, fields); 
        SuccessResponse.message = "Invoices retrieved by date successfully.";
        SuccessResponse.data = {
            invoices: rows,
            totalCount: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            pageSize: limit
          }
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse)
    } catch (error) {
        ErrorResponse.message = "Something went wrong while getting Invoices by date.";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)      
    }    
}


module.exports = {
 addInvoice,
 getInvoice,
 getAllInvoices,
 getPendingInvoices,
 getTodayInvoices,
 getInvoicesByDate
}