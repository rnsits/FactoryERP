const { StatusCodes } = require("http-status-codes");
const { VendorService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");

async function addVendor(req, res) {
    try {
        const { name, address, contact_person, email, mobile, pincode } = req.body;
       
        const vendor = await VendorService.createVendor({
            name,
            address,
            contact_person,
            pincode,      
            email,
            mobile,              
        });
        SuccessResponse.message = "Vendor added successfully";
        SuccessResponse.data = vendor;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.message = "Failed to add vendor.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
    
}

async function getVendor(req,res){
    try{
        const vendor = await VendorService.getVendor(req.params.vendorId);
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = vendor;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse) 
    } catch (error) {
        console.log(error);
        ErrorResponse.message = "Something went wrong while getting Vendor";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}

async function getAllVendors(req, res){
    try{
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit; 
        const search = req.query.search || '';
        const fields = req.query.fields ? req.query.fields.split(',') : [];
        const filter = req.query.filter || null;

        const { count, rows } = await
        VendorService.getAllVendors(limit, offset, search, fields); 
        SuccessResponse.message = "Vendors retrieved successfully.";
        SuccessResponse.data = {
            vendors: rows,
            totalCount: count, 
            totalPages: Math.ceil(count / limit), 
            currentPage: page,
            pageSize: limit
        };
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse)
    }catch(error) {
        ErrorResponse.message = "Something went wrong while getting Vendors";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}


module.exports = {
    addVendor,
    getVendor,
    getAllVendors
}