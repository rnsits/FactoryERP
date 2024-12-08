const { StatusCodes } = require("http-status-codes");
const { Customer_PaymentService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const AppError = require("../utils/errors/app.error");


async function addCustomerPayment(req, res) {
    try {
        const { customer_id, invoice_id, payment_date, amount, payment_method, payment_status  } = req.body;
       
        const payment = await Customer_PaymentService.createCustomer_Payment({
            customer_id, invoice_id, payment_date, amount, payment_method, payment_status  
        });
        SuccessResponse.message = "Customer_Payment added successfully";
        SuccessResponse.data = payment;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.message = "Failed to add customer payment.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
    
}

async function getCustomerPayment(req,res){
    try{
        const payment = await Customer_PaymentService.getCustomerPayment(req.params.customerPaymentId);
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = payment;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse) 
    } catch (error) {
        ErrorResponse.message = "Something went wrong while getting Customer Payment";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}

async function getAllCustomerPayments(req, res){
    try{
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit; 
        const search = req.query.search || '';
        const fields = req.query.fields ? req.query.fields.split(',') : [];
        const filter = req.query.filter || null;

        const { count, rows } = await Customer_PaymentService.getAllCustomerPayments(limit, offset, search, fields, filter);

        SuccessResponse.message = "Customer Payments retrieved successfully.";
        SuccessResponse.data = {
            customers: rows,
            totalCount: count, 
            totalPages: Math.ceil(count / limit), 
            currentPage: page,
            pageSize: limit
        };
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse)
    }catch(error) {
        ErrorResponse.message = "Something went wrong while getting Payments";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}

module.exports = {
   addCustomerPayment,
   getCustomerPayment,
   getAllCustomerPayments,
}