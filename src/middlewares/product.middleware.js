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


// function validateBodyRequest(req, res, next){
   
//     // Validate quantity_type to be one of the allowed values
//     // const validQuantityTypes = ["kg", "l", "m", "pcs"]; // Add more as needed
//     // if (!validQuantityTypes.includes(req.body.quantity_type)) {
//     //     ErrorResponse.message = "Something went wrong while creating a product.";
//     //     ErrorResponse.error = new AppError(["Invalid quantity type. Allowed types are 'kg', 'l', 'm', 'pcs'."], StatusCodes.BAD_REQUEST);
//     //     return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
//     // }

//     const name = req.body.name;
//     const description = req.body.description;
//     if(!name){
//         ErrorResponse.message = "Something went wrong while creating a product.";
//         ErrorResponse.error = new AppError(["Name missing."], StatusCodes.BAD_REQUEST);
//         return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
//     } else if(name.length < 3){
//         ErrorResponse.message = "Something went wrong while creating a product.";
//         ErrorResponse.error = new AppError(["Name should be atleast 3 character long."], StatusCodes.BAD_REQUEST);
//         return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
//     }

//     if(!["text", "audio"].includes(req.body.description_type)){
//         ErrorResponse.message = "Something went wrong while creating product.";
//         ErrorResponse.error = new AppError(["Descrption type must be either Text, Audio."], StatusCodes.BAD_REQUEST);
//         return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
//     }

//     if(description && description.length < 10){
//         ErrorResponse.message = "Something went wrong while creating a product.";
//         ErrorResponse.error = new AppError(["Description should be atleast 10 characters long."], StatusCodes.BAD_REQUEST);
//         return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
//     }
    
//     if (![
//         "kg", "tonne", "quintal", "l", "ml", "m", "cm", "pcs", "metric_cube"
//     ].includes(req.body.quantity_type)) {
//         ErrorResponse.message = "Something went wrong while creating a product.";
//         ErrorResponse.error = new AppError(
//             ["Invalid quantity type. Allowed types are 'kg', 'tonne', 'quintal', 'l', 'ml', 'm', 'cm', 'pcs', 'metric_cube'."],
//             StatusCodes.BAD_REQUEST
//         );
//         return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
//     }

//     next();
// };

// product_id, quantity, description, description_type
function validateDamagedProductRequest(req, res, next) {
    const { product_id, quantity, description, description_type } = req.body;

    if(!product_id) {
      ErrorResponse.message = "Something went wrong while updating products.";
      ErrorResponse.error = new AppError(["Product Id Missing."], StatusCodes.BAD_REQUEST);
      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(!quantity){
      ErrorResponse.message = "Something went wrong while updating products.";
      ErrorResponse.error = new AppError(["Product Id Missing."], StatusCodes.BAD_REQUEST);
      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(isNaN(Number(quantity)) || quantity < 1){
      ErrorResponse.message = "Something went wrong while updating products.";
      ErrorResponse.error = new AppError(["Invalid Quantity."], StatusCodes.BAD_REQUEST);
      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
  
    if(!description || description.length < 5){
      ErrorResponse.message = "Something went wrong while updating products.";
      ErrorResponse.error = new AppError(["Description Missing."], StatusCodes.BAD_REQUEST);
      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    } 

    if(!["text", "audio"].includes(description_type)){
        ErrorResponse.message = "Something went wrong while creating product.";
        ErrorResponse.error = new AppError(["Descrption type must be either Text, Audio."], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
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

function validateFormData(req, res, next) {
  
  let ErrorResponse = {}; // Initialize ErrorResponse

  // Helper function to send error responses
  const sendErrorResponse = (message, errors) => {
    ErrorResponse.message = message;
    ErrorResponse.error = new AppError(errors, StatusCodes.BAD_REQUEST);
    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  };

  // Check required fields
  if (!req.body.name) {
    return sendErrorResponse("Validation error", ["Name is required."]);
  }

  if(!req.body.tax) {
    return sendErrorResponse("Validation error", ["Tax is required."]);
  }

  // Validate Description
  if (!req.body.description || req.body.description.trim().length === 0) {
    return sendErrorResponse("Validation error", ["Description is required."]);
  }

  //Validate quantity type
  if (
    !['kg', 'tonne', 'quintal', 'l', 'ml', 'm', 'cm', 'pcs', 'metric_cube', 
        'bags', 'feet', 'sheets', 'bundles', 'yard', 'mm'].includes(
      req.body.quantity_type
    )
  ) {
    return sendErrorResponse("Validation error", [
      "Invalid quantity type. Allowed values are: 'kg', 'tonne', 'quintal', 'l', 'ml', 'm', 'cm', 'pcs', 'metric_cube', 'bags', 'feet', 'sheets', 'bundles', 'yard', 'mm'.",
    ]);
  }

  //Validate cost
  if (!req.body.product_cost || isNaN(Number(req.body.product_cost))) {
    return sendErrorResponse("Validation error", ["Product cost must be a number."]);
  }

  //Validate manufactured or not
  if (!req.body.isManufactured) {
    return sendErrorResponse("Validation error", ["Is Manufactured is required."]);
  }

  // Proceed if validation passes
  next();
}

// name, description, quantity_type, products
function validateMfcData(req, res, next) {
  if(!req.body.name) {
    ErrorResponse.message = "Something went wrong while creating maufactured product.";
    ErrorResponse.error = new AppError(["Name Missing."], StatusCodes.BAD_REQUEST);
    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }
  if(!req.body.stock) {
    ErrorResponse.message = "Something went wrong while creating maufactured product.";
    ErrorResponse.error = new AppError(["Stock Missing."], StatusCodes.BAD_REQUEST);
    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }
  if(!Array.isArray(req.body.products)) {
    ErrorResponse.message = "Something went wrong while creating maufactured product.";
    ErrorResponse.error = new AppError(["Products must be array."], StatusCodes.BAD_REQUEST);
    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }
  if(!req.body.description) {
    ErrorResponse.message = "Something went wrong while creating maufactured product.";
    ErrorResponse.error = new AppError(["Description Missing."], StatusCodes.BAD_REQUEST);
    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }
  if(!['kg', 'tonne', 'quintal', 'l', 'ml', 'm', 'cm', 'pcs', 'metric_cube', 
        'bags', 'feet', 'sheets', 'bundles', 'yard', 'mm'].includes(req.body.quantity_type)) {
    ErrorResponse.message = "Something went wrong while creating maufactured product.";
    ErrorResponse.error = new AppError(["Invalid quantity_type need to be 'kg', 'tonne', 'quintal', 'l', 'ml', 'm', 'cm', 'pcs', 'metric_cube', 'bags', 'feet', 'sheets', 'bundles', 'yard', 'mm'"], StatusCodes.BAD_REQUEST);
    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }
  next();
}

function updateImage(req, res, next){
  if(!req.body.product_id || isNaN(Number(req.body.product_id))) {
    ErrorResponse.message = "Something went wrong while updating image";
    ErrorResponse.error = new AppError(["Product Id missing."], StatusCodes.BAD_REQUEST);
    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }
  next();
}

module.exports = {
    // validateBodyRequest,
    validateGetRequest,
    validateBodyUpdate,
    validateReduce,
    validatePutBodyRequest,
    validateDamagedProductRequest,
    validateFormData,
    validateMfcData,
    updateImage
}
