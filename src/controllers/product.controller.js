const { StatusCodes } = require("http-status-codes");
const { ProductService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const AppError = require("../utils/errors/app.error");
const product = require("../models/product");

async function addProduct(req, res) {
    try {
        const { name, description, description_type, audio_path, category_id, inventory_id, quantity_type, stock, product_cost, product_image } = req.body;

        const product = await ProductService.createProduct({
            name,
            description,
            description_type,
            audio_path,
            category_id,
            inventory_id,
            quantity_type,
            stock,
            product_cost,
            product_image 
        });
        SuccessResponse.message = "Product added successfully";
        SuccessResponse.data = product;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.message = "Failed to add product.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}


async function getProduct(req, res) {
    try{
        const product = await ProductService.getProduct(req.params.productId);
        SuccessResponse.message = "Product fetched Successfully.";
        SuccessResponse.data = product;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    }catch(error){
        ErrorResponse.message = "Failed to fetch product.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

async function getProducts(req, res) {
    try {
        const products = await ProductService.getAllProducts();
        SuccessResponse.message = "Products retrieved successfully.";
        SuccessResponse.data = products;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.message = "Failed to fetch products.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

module.exports = {
    addProduct,
    getProducts,
    getProduct
}