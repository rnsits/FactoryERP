const { StatusCodes } = require("http-status-codes");
const { CategoryService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");


async function addCategory(req, res) {
    try {
        const { name, description, description_type, audio_path  } = req.body;
       
        const category = await CategoryService.createCategory({
            name, description, description_type, audio_path
        });
        SuccessResponse.message = "Category added successfully";
        SuccessResponse.data = category;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.message = "Failed to add category.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
    
}

async function getCategory(req,res){
    try{
        const category = await CategoryService.getCategory(req.params.categoryId);
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = category;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse) 
    } catch (error) {
        ErrorResponse.message = "Something went wrong while getting Category";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}

async function getAllCategories(req, res){
    try{
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit; 
        const search = req.query.search || '';
        const fields = req.query.fields ? req.query.fields.split(',') : [];

        const { count, rows } = await CategoryService.getAllCategories(limit, offset, search, fields);

        SuccessResponse.message = "Categories retrieved successfully.";
        SuccessResponse.data = {
            categories: rows,
            totalCount: count, 
            totalPages: Math.ceil(count / limit), 
            currentPage: page,
            pageSize: limit
        };
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse)
    }catch(error) {
        ErrorResponse.message = "Something went wrong while getting Categories";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}


module.exports = {
    addCategory,
    getCategory,
    getAllCategories
}