const { StatusCodes } = require("http-status-codes");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { findStateByPincode } = require('../../src/utils/common/pincodehelper');
const { InvoiceService, InventoryTransactionService, BalanceTransactionService, ProductService, CustomerService, UserService, Customer_PaymentService, } = require('../services');
const AppError = require("../utils/errors/app.error");
const { sequelize } = require("../models");
const { Customers } = require('../models');

async function addInvoice(req, res) {
    const transaction = await sequelize.transaction();
    const user_id = req.user.id;
    const {  
        customer_id,
        due_date,
        due_amount,
        payment_status,
        payment_method,
        pincode,
        address,
        mobile,
        products,
        tax
    } = req.body;
    
    const user = await UserService.getUser(user_id, {transaction});
    let payment_image = req.file ? `/uploads/images/${req.file.filename}`: null;

    const state = findStateByPincode(pincode);
    if(!state) {
        throw new AppError([`Invalid Pincode provided ${pincode}.`], StatusCodes.BAD_REQUEST);
    }

    try {
        let totalAmount = 0;
        let totalTax = 0;
        
        // Prepare items array with full product details
        const items = await Promise.all(
            products.map(async (item) => {
                const product = await ProductService.getProduct(item.product_id, {transaction});
                if (!product) {
                    throw new AppError([`Product with ID ${item.product_id} not found.`], StatusCodes.BAD_REQUEST);
                }
                if(item.quantity < 0) {
                    throw new AppError([`Quantity must be a positive number.`], StatusCodes.BAD_REQUEST);
                }

                if (item.quantity > product.stock) {
                    throw new AppError([`Requested quantity (${item.quantity}) exceeds available quantity (${product.stock}) for product ${product.name}.`], StatusCodes.BAD_REQUEST);
                }   

                const itemTotal = item.price * item.quantity;
                let taxAmount,cgst,sgst,igst;

                // Tax calculation logic (same as in your original code)
                let cgstRate,sgstRate,igstRate;
                if(req.body.tax) {
                    cgstRate = req.body.tax/2;
                    sgstRate = req.body.tax/2;
                    igstRate = req.body.tax;
                } else {
                    cgstRate = product.cgst_rate;
                    sgstRate = product.sgst_rate;
                    igstRate = product.igst_rate;
                }

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

                const inventoryTransaction = await InventoryTransactionService.createInventoryTransaction({
                    product_id: product.id,
                    transaction_type: 'out',
                    quantity: item.quantity,
                    quantity_type: product.quantity_type,
                    description: `${product.name}`,
                    description_type: 'text',
                    isDamaged: false,
                    isManufactured: product.isManufactured,
                }, { transaction });
        
                // need to update this it is making it zero here
                const newStock = Number(product.stock) - Number(item.quantity);
                const updatedProduct = await ProductService.reduceProductByQuantity(product.id, newStock, { transaction });

                totalAmount += itemTotal;
                totalTax += taxAmount;

                // Return full product details along with invoice-specific information
                return {
                    product_id: product.id,
                    product_name: product.name,
                    product_details: {
                        sku: product.sku,
                        description: product.description,
                        category: product.category,
                        // Add any other product details you want to include
                    },
                    quantity: item.quantity,
                    unit_price: item.price,
                    total_price: itemTotal,
                    tax_details: {
                        cgst_rate: cgstRate,
                        sgst_rate: sgstRate,
                        igst_rate: igstRate,
                        cgst_amount: cgst,
                        sgst_amount: sgst,
                        igst_amount: igst,
                        total_tax_amount: taxAmount
                    },
                };
            })
        );

        const tt = totalAmount + totalTax;


        // Determine due_amount based on payment_status
        let calculatedDueAmount;
        if (payment_status == "unpaid") {
            calculatedDueAmount = tt; // Full amount due
        } else if (payment_status == "partial paid") {
            if (!due_amount || due_amount <= 0 ) {
                throw new AppError(
                    ["Invalid due amount for partial payment. Must be between 1 and the total amount."],
                    StatusCodes.BAD_REQUEST
                );
            }
            if(due_amount > tt) {
                throw new AppError(["Due Amount cannot be greater than the total price."], StatusCodes.BAD_REQUEST);
            }
            calculatedDueAmount = due_amount;
        } else if (payment_status == "paid") {
            calculatedDueAmount = 0; // Fully paid
        } else {
            throw new AppError(["Invalid payment status provided."], StatusCodes.BAD_REQUEST);
        }
        // Create invoice with items included
        const invoice = await InvoiceService.createInvoice({
            customer_id, 
            due_date, 
            due_amount: calculatedDueAmount, 
            payment_status, 
            payment_method, 
            pincode, 
            address, 
            mobile,
            total_amount: tt,
            total_tax: totalTax, 
            payment_image,
            items: items,
            item_count: items.length,
            user_id: user_id
        }, { transaction });

            let createPayment;
            let newBalance;
            let userBalance, balanceTransaction;
            const mappedPaymentStatus = invoice.payment_status === "partial paid" ? "partial-paid" : invoice.payment_status;
            if(invoice.payment_status == "paid" || invoice.payment_status =="partial paid") {
                newBalance = Number(user.current_balance) + (Number(tt)-calculatedDueAmount);
                
                balanceTransaction = await BalanceTransactionService.createBalanceTransactions({
                    user_id: user.id,
                    transaction_type: "income",
                    amount: newBalance,
                    source: "invoice",
                    previous_balance: user.current_balance,
                    new_balance: newBalance
                }, {transaction});
            
                userBalance = await UserService.updateUserBalance(
                    user.id,
                    newBalance, {transaction}
                );
                createPayment = await Customer_PaymentService.createCustomer_Payment({
                    customer_id: invoice.customer_id,
                    invoice_id: invoice.id, 
                    payment_date: new Date(), 
                    amount: tt-calculatedDueAmount, 
                    payment_method: invoice.payment_method, 
                    payment_status: mappedPaymentStatus    
                }, {transaction});
            } else if(invoice.payment_status == "unpaid"){
                balanceTransaction = await BalanceTransactionService.createBalanceTransactions({
                    user_id: user.id,
                    transaction_type: "income",
                    amount: tt,
                    source: "invoice",
                    previous_balance: user.current_balance,
                    new_balance: user.current_balance
                }, {transaction});
                console.log("due date", req.body.due_date);
                
                createPayment = await Customer_PaymentService.createCustomer_Payment({
                    customer_id: invoice.customer_id,
                    invoice_id: invoice.id, 
                    payment_date: due_date, 
                    amount: tt-calculatedDueAmount, 
                    payment_method: invoice.payment_method, 
                    payment_status: invoice.payment_status
                }, {transaction});
                // No need to update balance since no payment done
            }

        await transaction.commit();

        SuccessResponse.message = "Invoice Added Successfully.";
        SuccessResponse.data = { invoice, createPayment, userBalance, balanceTransaction }
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        console.log(error);
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
        const filter = req.query.filter || null;

        const { count, rows } = await InvoiceService.getAllInvoices(limit, offset, search, fields, filter);

        const withNames = await Promise.all(
            rows.map(async (row) => {
                // Fetch the product name based on product_id
                const customer = await Customers.findByPk(row.customer_id, {
                    attributes: ['name'], // Only fetch the `name` field
                });

                return {
                    ...row,
                    customer_name: customer ? customer.name : null, // Include product name if found
                };
            })
        );

        SuccessResponse.message = "Invoices retrieved successfully.";
        SuccessResponse.data = {
            invoices: withNames,
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
        SuccessResponse.data = {
            invoices
        };
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
        
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit; 
        const search = req.query.search || '';
        const fields = req.query.fields ? req.query.fields.split(',') : [];
        const date = new Date();
        const { count, rows, totalAmount } = await InvoiceService.getInvoicesByDate(date, limit, offset, search, fields); 
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = {
            invoices: rows,
            totalAmount,
            totalCount: count, 
            totalPages: Math.ceil(count / limit), 
            currentPage: page,
            pageSize: limit
        };
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

// async function markInvoicePaid(req, res) {
//     const transaction = await sequelize.transaction();

//     try {
//         const user = req.user;
//         const { id, amount } = req.body;
//         const invoice = await InvoiceService.getInvoice(id, {transaction});
//         if(!invoice) {
//             throw new AppError(["Invoice not found."],StatusCodes.NOT_FOUND);
//         }
//         if(invoice.payment_status == "paid") {
//             throw new AppError(["Invoice already marked paid"], StatusCodes.BAD_REQUEST);
//         }
//         if(amount > invoice.total_amount && amount > invoice.due_amount) {
//             throw new AppError(["Amount paid is greater than the total cost or due amount of invoice."], StatusCodes.BAD_REQUEST);
//         }

//         let finalStatus;
//         let finalDueAmount;
//         let payment_method = invoice.payment_method;
//         const newAmount = invoice.due_amount - Number(amount);
//         finalStatus = newAmount == 0 ? "paid" : "partial paid";
//         finalDueAmount = newAmount == 0 ? 0 : newAmount;

//         const updateInvoice = await InvoiceService.markInvoicePaid(invoice.id, finalStatus, finalDueAmount, { transaction });

//         const customer = await CustomerService.getCustomer(invoice.customer_id, { transaction });
        
//         let createPayment ;
//         console.log("fial",finalStatus);
//         if(finalStatus != "paid"){
//             createPayment = await Customer_PaymentService.createCustomer_Payment({
//                 customer_id: customer.id,
//                 invoice_id: invoice.id, 
//                 payment_date: new Date(), 
//                 amount: amount, 
//                 payment_method: payment_method, 
//                 payment_status: finalStatus,
//             }, {transaction});
//         } else if(finalStatus == "paid") {
//             createPayment = await Customer_PaymentService.createCustomer_Payment({
//                 customer_id: customer.id,
//                 invoice_id: invoice.id,
//                 payment_date: new Date(),
//                 amount: amount,
//                 payment_method,
//                 payment_status: "paid"
//             }, {transaction});
//         }
        

//         const newBalance = user.current_balance + amount;
//         const balanceTransaction = await BalanceTransactionService.createBalanceTransactions({
//             user_id: user.id,
//             transaction_type: "income",
//             amount: amount,
//             source: "invoice",
//             previous_balance: user.currentBalance,
//             new_balance: newBalance
//         }, {transaction});

       
//         const userBalance = await UserService.updateUserBalance(
//             user.id,
//             newBalance, {transaction}
//         );
        
//         await transaction.commit();

//         SuccessResponse.message = 'Invoice marked paid/partial-paid successfully.';
//         SuccessResponse.data = {
//             updateInvoice,
//             userBalance,
//             balanceTransaction,createPayment
//         }
//         return res.status(StatusCodes.OK).json(SuccessResponse);
//     } catch (error) {
//         console.log(error);
//         await transaction.rollback();
//         ErrorResponse.message ="Something went wrong while marking the Invoice.";
//         ErrorResponse.error = error;
//         return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
//     }
// }

async function markInvoicePaid(req, res) {
    const transaction = await sequelize.transaction();

    try {
        const user = req.user;
        const { id, amount, due_date } = req.body;
        const invoice = await InvoiceService.getInvoice(id, {transaction});
        if(!invoice) {
            throw new AppError(["Invoice not found."],StatusCodes.NOT_FOUND);
        }
        if(invoice.payment_status == "paid") {
            throw new AppError(["Invoice already marked paid"], StatusCodes.BAD_REQUEST);
        }
        if(amount > invoice.total_amount || amount > invoice.due_amount) {
            throw new AppError(["Amount cannot be greater than the total cost or due amount of invoice."], StatusCodes.BAD_REQUEST);
        }
        if(amount < invoice.due_amount && !due_date) {
            throw new AppError(["Amount is less than due amount please add due date."],StatusCodes.BAD_REQUEST);
        }
        if(new Date(due_date) < new Date(invoice.due_date)) {
            throw new AppError([`Due Date cannot be less than invoice Due date ${invoice.due_date}.`], StatusCodes.BAD_REQUEST);
        }

        let finalStatus;
        let finalDueAmount;
        let finalDueDate;
        let payment_method = invoice.payment_method;
        const newAmount = invoice.due_amount - Number(amount);
        
        // Determine final status
        if (newAmount == 0) {
            finalStatus = "paid";
        } else if (newAmount > 0) {
            finalStatus = "partial paid";
            finalDueDate = new Date(due_date);
        } else {
            finalStatus = "unpaid";
            finalDueDate = new Date(due_date);
        }
        
        finalDueAmount = newAmount;

        const updateInvoice = await InvoiceService.markInvoicePaid(invoice.id, finalStatus, finalDueAmount, { transaction });

        const customer = await CustomerService.getCustomer(invoice.customer_id, { transaction });
        
        let createPayment;
        // Handle payment creation for all statuses
        createPayment = await Customer_PaymentService.createCustomer_Payment({
            customer_id: customer.id,
            invoice_id: invoice.id, 
            payment_date: new Date(), 
            amount: amount, 
            payment_method: payment_method, 
            payment_status: finalStatus == "partial paid" ? "partial-paid" : finalStatus, // Use the determined status
        }, {transaction});

        const userdata = await UserService.getUser(user.id, {transaction});
        
        const newBalance = Number(userdata.current_balance) + Number(amount);
        const balanceTransaction = await BalanceTransactionService.createBalanceTransactions({
            user_id: user.id,
            transaction_type: "income",
            amount: amount,
            source: "invoice",
            previous_balance: userdata.current_balance,
            new_balance: newBalance
        }, {transaction});

        const userBalance = await UserService.updateUserBalance(
            user.id,
            newBalance, {transaction}
        );
        
        await transaction.commit();

        SuccessResponse.message = 'Invoice marked paid/partial-paid/unpaid successfully.';
        SuccessResponse.data = {
            updateInvoice,
            userBalance,
            balanceTransaction,
            createPayment
        }
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        console.log(error);
        await transaction.rollback();
        ErrorResponse.message ="Something went wrong while marking the Invoice.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

async function getMonInv(req, res) {
    try {   
        // Pagination parameters
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit; 

        // Search parameters
        const search = req.query.search || '';
        const fields = req.query.fields ? req.query.fields.split(',') : [];

        // Use current date for monthly invoices
        const date = new Date();

        // Fetch invoices
        const { count, rows, totalAmount } = await InvoiceService.getInvoicesByMonth(
            date, 
            limit, 
            offset, 
            search, 
            fields
        ); 

        // Prepare success response
        SuccessResponse.message = "Invoices retrieved successfully";
        SuccessResponse.data = {
            invoices: rows,
            totalAmount,
            totalCount: count, 
            totalPages: Math.ceil(count / limit), 
            currentPage: page,
            pageSize: limit
        };

        // Return successful response
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch(error) {
        // Log the error for server-side tracking
        console.error('Error in getMonInv:', error);

        // Prepare error response
        ErrorResponse.message = "Failed to retrieve invoices";
        ErrorResponse.error = {
            message: error.message,
            // Optionally include stack trace in development
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        };

        // Return error response
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
}

async function updateImage(req, res) {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.body;
        let payment_image = req.file ? `/uploads/images/${req.file.filename}`: null;
        if(!payment_image) {
            await transaction.rollback();
            ErrorResponse.message = "Image file is required.";
            return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }
        const invoice = await InvoiceService.getInvoice(id, {transaction});
        if(!invoice) {
            await transaction.rollback();
            ErrorResponse.message = "Invoice does not exists.";
            return res.status(StatusCodes.NOT_FOUND).json(ErrorResponse);
        }
        const updatedInvoice = await InvoiceService.updateImage(id, payment_image, {transaction});

        transaction.commit();
        SuccessResponse.message = "Invoice Image updated Successfully.";
        SuccessResponse.data = updatedInvoice;
        return res.status(StatusCodes.ACCEPTED).json(SuccessResponse);
    } catch (error) {
        console.log(error);
        await transaction.rollback();
        ErrorResponse.message ="Something went wrong while updating the Invoice image.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}


module.exports = {
 addInvoice,
 getInvoice,
 getAllInvoices,
 getPendingInvoices,
 getTodayInvoices,
 getInvoicesByDate,
 markInvoicePaid,
 getMonInv,
 updateImage
}