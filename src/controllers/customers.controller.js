const { StatusCodes } = require("http-status-codes");
const { CustomerService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const AppError = require("../utils/errors/app.error");


async function addCustomers(req, res) {
    try {
        const { name, address, mobile, pincode, email  } = req.body;
       
        const customer = await CustomerService.createCustomer({
            name, address, mobile, pincode, email
        });
        SuccessResponse.message = "Customer added successfully";
        SuccessResponse.data = customer;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
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
        ErrorResponse.message = "Something went wrong while getting Customer";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}

async function getAllCustomers(req, res){
    try{
        // const customers = await CustomerService.getAllCustomers(); 
        // SuccessResponse.message = "Successfully completed the request";
        // SuccessResponse.data = customers;

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
        ErrorResponse.message = "Something went wrong while getting Customers";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}


module.exports = {
   addCustomers,
   getCustomer,
   getAllCustomers
}