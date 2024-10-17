const { StatusCodes } = require("http-status-codes");
const { InvoiceService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const axios = require('axios');

const instance = axios.create({
    baseURL: 'https://api.postalpincode.in',
    // httpsAgent: new (require('https')).Agent({  
    //   rejectUnauthorized: false // Disables SSL verification
    // })
    timeout: 10000,
  });

async function addInvoice(req, res) {
    try {
        const {  
        customer_id,
        invoice_item_id,
        invoice_date,
        due_date,
        due_amount,
        payment_status,
        payment_method,
        total_amount,
        pincode,
        address,
        mobile,
        customer_payment_image  } = req.body;

        const response = await instance.get(`/pincode/${pincode}`);
        const postOffice = response.data[0].PostOffice[0];

        
       
        const invoice = await InvoiceService.createInvoice({
            invoice_item_id,
            customer_id,
            invoice_date,
            due_date,
            due_amount,
            payment_status,
            payment_method,
            total_amount,
            pincode,
            address,
            mobile,
            customer_payment_image
        });
        console.log("Invoice Id   :",invoice.invoice_id);
        SuccessResponse.message = "Invoice added successfully";
        SuccessResponse.data = invoice;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.message = "Failed to add Invoice.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
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
        console.log(error);
        ErrorResponse.message = "Something went wrong while getting Invoice.";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}

async function getAllInvoices(req, res){
    try{
        const invoices = await InvoiceService.getAllInvoices(); 
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = invoices;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse)
    }catch(error) {
        console.log(error);
        ErrorResponse.message = "Something went wrong while getting Invoices";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}


module.exports = {
 addInvoice,
 getInvoice,
 getAllInvoices   
}