const {StatusCodes} = require('http-status-codes');
const {ErrorResponse} = require('../utils/common');
const AppError = require('../utils/errors/app.error');

function validateGetRequest(req,res,next){

    // Validate if productId is a valid integer
    const productId = req.params.productId;
    if (isNaN(productId) || parseInt(productId) <= 0) {
        ErrorResponse.message = "Something went wrong while getting product.";
        ErrorResponse.error = new AppError(["Invalid product ID. Must be a positive number."])
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(!productId){
        ErrorResponse.message = "Something went wrong while getting product.";
        ErrorResponse.error = new AppError(["Product Id not found on the incoming request."],StatusCodes.BAD_REQUEST)
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    next();
}

function validateBodyUpdate(req, res, next){
    const productId = req.params.productId;
    const quantity = req.body.quantity;
    if (isNaN(productId) || parseInt(productId) <= 0) {
        ErrorResponse.message = "Something went wrong while getting product.";
        ErrorResponse.error = new AppError(["Invalid product ID. Must be a positive number."]);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(!productId){
        ErrorResponse.message = "Something went wrong while getting product";
        ErrorResponse.error = new AppError(["Product Id not found on the incoming request"],StatusCodes.BAD_REQUEST);
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    if(isNaN(quantity) || parseInt(quantity) <=0){
        ErrorResponse.message = "Something went wrong while getting product.";
        ErrorResponse.error = new AppError(["Invalid quantity. Must be a positive number."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(req.body.transaction_type && (req.body.transaction_type !== "in" || req.body.transaction_type !== "out")) {
        ErrorResponse.message = "Something went wrong while updating product";
        ErrorResponse.error = new AppError(["Transaction Type must be 'in' or 'out'." ], StatusCodes.BAD_REQUEST);
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse)
    }
    next();
}

function validateReduce(req, res, next){
    const productId = req.params.productId;
    const quantity = req.body.quantity;
    if (isNaN(productId) || parseInt(productId) <= 0) {
        ErrorResponse.message = "Something went wrong while getting product.";
        ErrorResponse.error = new AppError(["Invalid product ID. Must be a positive number."]);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(!productId){
        ErrorResponse.message = "Something went wrong while getting product";
        ErrorResponse.error = new AppError(["Product Id not found on the incoming request"],StatusCodes.BAD_REQUEST);
        return res 
               .status(StatusCodes.BAD_REQUEST)
               .json(ErrorResponse)
    }
    if(isNaN(quantity) || parseInt(quantity) <=0){
        ErrorResponse.message = "Something went wrong while getting product.";
        ErrorResponse.error = new AppError(["Invalid quantity. Must be a positive number."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
}


function validateBodyRequest(req, res, next){
   
    // Validate quantity_type to be one of the allowed values
    // const validQuantityTypes = ["kg", "l", "m", "pcs"]; // Add more as needed
    // if (!validQuantityTypes.includes(req.body.quantity_type)) {
    //     ErrorResponse.message = "Something went wrong while creating a product.";
    //     ErrorResponse.error = new AppError(["Invalid quantity type. Allowed types are 'kg', 'l', 'm', 'pcs'."], StatusCodes.BAD_REQUEST);
    //     return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    // }

    const name = req.body.name;
    const description = req.body.description;
    if(!name){
        ErrorResponse.message = "Something went wrong while creating a product.";
        ErrorResponse.error = new AppError(["Name missing."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    } else if(name.length < 3){
        ErrorResponse.message = "Something went wrong while creating a product.";
        ErrorResponse.error = new AppError(["Name should be atleast 3 character long."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if(!["text", "audio"].includes(req.body.description_type)){
        ErrorResponse.message = "Something went wrong while creating product.";
        ErrorResponse.error = new AppError(["Descrption type must be either Text, Audio."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if(description && description.length < 10){
        ErrorResponse.message = "Something went wrong while creating a product.";
        ErrorResponse.error = new AppError(["Description should be atleast 10 characters long."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    
    if (![
        "kg", "tonne", "quintal", "l", "ml", "m", "cm", "pcs", "metric_cube"
    ].includes(req.body.quantity_type)) {
        ErrorResponse.message = "Something went wrong while creating a product.";
        ErrorResponse.error = new AppError(
            ["Invalid quantity type. Allowed types are 'kg', 'tonne', 'quintal', 'l', 'ml', 'm', 'cm', 'pcs', 'metric_cube'."],
            StatusCodes.BAD_REQUEST
        );
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    next();
};

// function damagedBodyRequest(req, res, next){
//     // Check Products is array or not
//     const {products, description_type} = req.body;
//     if (!Array.isArray(products) || products.length === 0) {
//         ErrorResponse.message = "Something went wrong while registering damaged products.";
//         ErrorResponse.error = new AppError(["Please provide atleast one product."], StatusCodes.BAD_REQUEST);
//         return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
//     }
//     // Validate description_type
//     if (!['text', 'audio'].includes(description_type)) {
//         ErrorResponse.message = "Something went wrong while registering damaged products.";
//         ErrorResponse.error = new AppError(["Invalid Description Type."], StatusCodes.BAD_REQUEST);
//         return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
//     }

//     next();
// }

function validateDamagedProductRequest(req, res, next) {
    const { products, description_type } = req.body;
  
    // Check if `products` is an array and `description_type` is valid
    if (!Array.isArray(products) || !['text', 'audio'].includes(description_type)) {
      return res.status(400).json({
        message: "Invalid request. Ensure 'products' is an array and 'description_type' is either 'text' or 'audio'."
      });
    }
  
    // Validate each product in the `products` array
    for (const product of products) {
      const { product_id, quantity, description } = product;
  
      // Validate `product_id` to be a number
      if (typeof product_id !== 'number' || isNaN(product_id)) {
        return res.status(400).json({
          message: `Invalid product_id in product entry. 'product_id' must be a number.`
        });
      }
  
      // Validate `quantity` to be a number
      const quantityNumber = Number(quantity); // Convert to number
      if (isNaN(quantityNumber) || quantityNumber <= 0) {
        return res.status(400).json({
          message: `Invalid quantity in product entry. 'quantity' must be a positive number.`,
          invalidProduct: product
        });
      }
  
      // Optionally, check for non-empty description if required
      if (typeof description !== 'string' || !description.trim()) {
        return res.status(400).json({
          message: `Invalid description in product entry. 'description' must be a non-empty string.`,
          invalidProduct: product
        });
      }
    }
  
    // All validations passed
    next();
  }
  

function validatePutBodyRequest(req, res, next) {
    const {products} = req.body;
    if (!Array.isArray(products) || products.length === 0) {
        ErrorResponse.message = "Something went wrong while updating products.";
        ErrorResponse.error = new AppError(["Invalid products input"], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
      }
      for (const product of products) {
        if (!product.id || !product.quantity || !product.transaction_type) {
          ErrorResponse.message = "Something went wrong while updating products.";
          ErrorResponse.error = new AppError(["Invalid product data structure"], StatusCodes.BAD_REQUEST);
          return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }
        if (!['in', 'out'].includes(product.transaction_type)) {
          ErrorResponse.message = "Something went wrong while updating products.";
          ErrorResponse.error = new AppError(["Invalid transaction type"], StatusCodes.BAD_REQUEST);
          return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }
        if (product.quantity <= 0) {
          ErrorResponse.message = "Something went wrong while updating products.";
          ErrorResponse.error = new AppError(["Quantity must be greater than 0"], StatusCodes.BAD_REQUEST);
          return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }
      }

    next();
}

module.exports = {
    validateBodyRequest,
    validateGetRequest,
    validateBodyUpdate,
    validateReduce,
    validatePutBodyRequest,
    validateDamagedProductRequest
}