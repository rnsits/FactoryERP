const { StatusCodes } = require("http-status-codes");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { findStateByPincode } = require('../../src/utils/common/pincodehelper');
const { InvoiceService, InventoryTransactionService, BalanceTransactionService, ProductService, CustomerService, UserService, Customer_PaymentService, } = require('../services');
const AppError = require("../utils/errors/app.error");
const { sequelize } = require("../models");

//add audio here
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
        products,
    } = req.body;

    let payment_image = req.file ? `/uploads/images/${req.file.filename}`: null;
    console.log("image", payment_image);
    
    
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
            total_tax: 0, 
            payment_image,
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
                    description_type: 'text',
                    image_path: payment_image
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
                    total: itemTotal + taxAmount,
                    payment_image,
                };
                invoiceProducts.push(invoiceProduct);

                return invoiceProduct;
            })
        );

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
            item_count: products.length,
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

        // Fetch complete invoice with all related data
        // const completeInvoice = await InvoiceService.getInvoiceById(invoice.id, {
        //     include: ['customer', 'products']
        // });
        const completeInvoice = await InvoiceService.getInvoice(invoice.id);

        await transaction.commit();
        SuccessResponse.message = "Invoice added successfully";
        SuccessResponse.data = { invoice: completeInvoice };
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

        SuccessResponse.message = "Invoices retrieved successfully.";
        SuccessResponse.data = {
            invoices: rows,
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
        
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit; 
        const search = req.query.search || '';
        const fields = req.query.fields ? req.query.fields.split(',') : [];
        const date = new Date();
        const { count, rows } = await InvoiceService.getInvoicesByDate(date, limit, offset, search, fields); 
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = {
            invoices: rows,
            totalCount: count, 
            totalPages: Math.ceil(count / limit), 
            currentPage: page,
            pageSize: limit
        };
        // const invoices = await InvoiceService.getTodayInvoices(); 
        // SuccessResponse.message = "Successfully completed the request";
        // SuccessResponse.data = invoices;
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

async function markInvoicePaid(req, res) {
    const transaction = await sequelize.transaction();

    try {
        const user = req.user;
        const { id, amount } = req.body;
        if(amount < 0) {
            throw new AppError("Amount cannot be negative.",StatusCodes.BAD_REQUEST);
        }
        const invoice = await InvoiceService.getInvoice(id, {transaction});
        if(!invoice) {
            throw new AppError("Invoice not found.",StatusCodes.NOT_FOUND);
        }
        if(invoice.payment_status === "paid") {
            throw new AppError(`Invoice already marked paid`, StatusCodes.BAD_REQUEST);
        }
        if(amount > invoice.total_amount) {
            throw new AppError(`Amount paid is greater than the total cost of invoice.`, StatusCodes.BAD_REQUEST);
        }

        let status = invoice.payment_status;
        let payment_method = invoice.payment_method;
        const newAmount = invoice.total_amount - Number(amount);
        status = newAmount === 0 ? "paid" : "partial paid";

        const updateInvoice = await InvoiceService.markInvoicePaid(invoice.id, status, newAmount, { transaction });

        const customer = await CustomerService.getCustomer(invoice.customer_id, { transaction });

        console.log("invoice", invoice);
        
        let createPayment ;
        if(status == "partial paid"){
            const status = "partial-paid";
            createPayment = await Customer_PaymentService.createCustomer_Payment({
                customer_id: customer.id,
                invoice_id: invoice.id, 
                payment_date: new Date(), 
                amount: amount, 
                payment_method: payment_method, 
                payment_status: status,
            }, {transaction})
        }
        

        const balanceTransaction = await BalanceTransactionService.createBalanceTransactions({
            user_id: user.id,
            transaction_type: "income",
            amount: amount,
            source: "invoice",
            previous_balance: invoice.total_amount,
            new_balance: newAmount
        }, {transaction});

        const newBalance = user.current_balance + amount;
        const userBalance = await UserService.updateUserBalance(
            user.id,
            newBalance, {transaction}
        );
        
        await transaction.commit();

        SuccessResponse.message = 'Invoice marked paid/partial-paid successfully.';
        SuccessResponse.data = {
            updateInvoice,
            userBalance,
            balanceTransaction,createPayment
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


module.exports = {
 addInvoice,
 getInvoice,
 getAllInvoices,
 getPendingInvoices,
 getTodayInvoices,
 getInvoicesByDate,
 markInvoicePaid,
}