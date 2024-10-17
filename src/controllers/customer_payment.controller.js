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
        console.log(error);
        ErrorResponse.message = "Something went wrong while getting Customer Payment";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}

async function getAllCustomerPayments(req, res){
    try{
        const payments = await Customer_PaymentService.getAllCustomerPayments(); 
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = payments;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse)
    }catch(error) {
        console.log(error);
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
   getAllCustomerPayments
}