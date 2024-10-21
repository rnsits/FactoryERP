const { StatusCodes } = require("http-status-codes");
const { InvoiceService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { getPostOffice, findStateByPincode } = require('../../src/utils/common/pincodehelper');
const { Invoice_ItemService } = require('../services');
const AppError = require("../utils/errors/app.error");

async function addInvoice(req, res) {
    try {
        const {  
            customer_id,
            due_date,
            due_amount,
            payment_status,
            payment_method,
            pincode,
            address,
            mobile,
            items
        } = req.body;

        const state = findStateByPincode(pincode);
        if(!state){
            throw new AppError(['Invalid Pincode provided ${pincode}.'], StatusCodes.BAD_REQUEST);
        }

        const invoice = await InvoiceService.createInvoice({
            customer_id, due_date, due_amount, payment_status, payment_method, pincode, address, mobile,
        });

        let totalAmount = 0;
        let totalTax = 0;

        const invoiceItems = await Promise.all(
            items.map(async (item) => {
                const itemData = await Invoice_ItemService.getInvoiceItem(item.id);
                if (!itemData) {
                    throw new AppError([`Invoice item with ID ${item.id} not found.`], StatusCodes.BAD_REQUEST);
                }

                if (item.quantity > itemData.quantity) {
                    throw new AppError([`Requested quantity (${item.quantity}) exceeds available quantity (${itemData.quantity}) for item ID ${item.id}.`], StatusCodes.BAD_REQUEST);
                }

                const itemTotal = itemData.unit_price * item.quantity;
                let taxAmount = 0;

                 if (payment_method !== 'cash') {
                    if (state.toLowerCase() === 'rajasthan') {
 
                        const cgst = (itemTotal * itemData.cgst_rate) / 100;
                        const sgst = (itemTotal * itemData.sgst_rate) / 100;
                        taxAmount = cgst + sgst;
                    } else {
 
                        const igst = (itemTotal * itemData.igst_rate) / 100;
                        taxAmount = igst;
                    }
                }

                totalAmount += itemTotal;
                totalTax += taxAmount;

                 return itemData;
            })
        );

        await Promise.all(
            items.map(async (item) => {
                const itemData = invoiceItems.find(data => data.id === item.id);
                const newQuantity = itemData.quantity - item.quantity;

                await Invoice_ItemService.updateInvoiceItem(item.id, { quantity: newQuantity });
            })
        );

        invoice.total_amount = totalAmount + totalTax; 
        invoice.total_tax = totalTax; 
        invoice.items = items;
        invoice.item_count = items.length;
        await invoice.save();

        SuccessResponse.message = "Invoice added successfully";
        SuccessResponse.data = { invoice };
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