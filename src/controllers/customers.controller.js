const { StatusCodes } = require("http-status-codes");
const { CustomerService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const AppError = require("../utils/errors/app.error");
const { sequelize } = require("../models");


async function addCustomers(req, res) {
    try {
        const { name, address, mobile, pincode, email, customer_type, gstin  } = req.body;
       
        const customer = await CustomerService.createCustomer({
            name, customer_type, address, mobile, pincode, email, gstin
        });
        SuccessResponse.message = "Customer added successfully";
        SuccessResponse.data = customer;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        console.log(error);
        ErrorResponse.message = "Failed to add customer.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
    
}

async function getCustomer(req,res){
    try{
        const customer = await CustomerService.getCustomer(req.params.customerId);
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = customer;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse) 
    } catch (error) {
        console.log(error);
        ErrorResponse.message = "Something went wrong while getting Customer";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}

async function getAllCustomers(req, res){
    try{
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit; 
        const search = req.query.search || '';
        const fields = req.query.fields ? req.query.fields.split(',') : [];
        const filter = req.query.filter || '';

        const { count, rows } = await CustomerService.getAllCustomers(limit, offset, search, fields, filter);

        SuccessResponse.message = "Customers retrieved successfully.";
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
        console.log(error);
        ErrorResponse.message = "Something went wrong while getting Customers";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}

async function customerSettings(req, res) {
    const transaction = await sequelize.transaction();
    try {
        const { name, address, mobile, pincode, email, customer_type, gstin } = req.body;
        
        const { id } = req.params; // Extract `id` from route parameter
        
        const check = await CustomerService.getCustomer(id, {transaction});
        if(!check) {
            throw new AppError(["Customer not found."], StatusCodes.NOT_FOUND)
        }
        // Build the update object dynamically
        const updateData = {};
        if (name) updateData.name = name;
        if (address) updateData.address = address;
        if (mobile) updateData.mobile = mobile;
        if (pincode) updateData.pincode = pincode;
        if (email) updateData.email = email;
        if (customer_type) updateData.customer_type = customer_type;
        if (gstin) updateData.gstin = gstin;

        if (Object.keys(updateData).length == 0) {
            throw new AppError(["At least one field is required to update the customer."], StatusCodes.CONFLICT);
        }

        const customer = await CustomerService.updateCustomer(id, updateData, {transaction});
        await transaction.commit();
        SuccessResponse.message = "Customer updated successfully.";
        SuccessResponse.data = customer;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        ErrorResponse.message = "Something went wrong while updating the customer.";
        ErrorResponse.error = error.message;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}



module.exports = {
   addCustomers,
   getCustomer,
   getAllCustomers,
   customerSettings
}