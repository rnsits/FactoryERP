const { StatusCodes } = require("http-status-codes");
const { ProductService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const AppError = require("../utils/errors/app.error");
const product = require("../models/product");

async function addProduct(req, res) {
    try {
        const { name, description, description_type, audio_path, category_id, inventory_id, quantity_type, stock, product_cost, product_image } = req.body;
        
        // Validate description_type to be either "audio" or "text"
        const validDescriptionTypes = ["audio", "text"];
        if (!validDescriptionTypes.includes(description_type)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid description type. Allowed types are 'audio' and 'text'."
            });
        }

        // If description_type is "audio", ensure audio_path is provided
        if (description_type === "audio" && !audio_path) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Audio path must be provided when description type is 'audio'."
            });
        }

        // Validate quantity_type to be one of the allowed values
        const validQuantityTypes = ["kg", "l", "m", "pcs"]; // Add more as needed
        if (!validQuantityTypes.includes(quantity_type)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid quantity type. Allowed types are 'kg', 'l', 'm', 'pcs'."
            });
        }

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
        const peoduct = await ProductService.getProduct();
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
        const products = await ProductService.getProducts();
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