const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { ProductRepository, InventoryTransactionRepository } = require("../repositories");
const { SuccessResponse } = require("../utils/common");
const {sequelize} = require("../models");

const productRepository = new ProductRepository();
const inventoryTransactionRepository = new InventoryTransactionRepository();


async function createProduct(data) {
    try{
        const product = await productRepository.create(data);
        return product;
      }catch(error){
        console.log(error);
      if (
        error.name == "SequelizeValidationError" ||
        error.name == "SequelizeUniqueConstraintError"
      ) {
        let explanation = [];
        error.errors.forEach((err) => {
          explanation.push(err.message);
        });
        throw new AppError(explanation, StatusCodes.BAD_REQUEST);
      }
      throw new AppError(
        "Cannot create a new Product",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
}

async function getProduct(data) {
    try {
        const product = await productRepository.get(data);
        return product;
    } catch(error) {
        console.log(error);
        if(
            error.name == "SequelizeValidationError" ||
            error.name == "SequelizeUniqueConstraintError"
        ) {
          let explanation = [];
          error.errors.forEach((err) => {
            explanation.push(err.message);
          });
          throw new AppError(explanation, StatusCodes.BAD_REQUEST);
        } else if (
          error.name === "SequelizeDatabaseError" &&
          error.original &&
          error.original.routine === "enum_in"
        ) {
          throw new AppError(
            "Invalid value for associate_with field.",
            StatusCodes.BAD_REQUEST
          );
        }
        throw new AppError(
          "Cannot get Product associate with the field",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function getAllProducts() {
    try {
        const products = await productRepository.getAll();
        return products;
    } catch(error) {
        console.log(error);
        if(
            error.name == "SequelizeValidationError" ||
            error.name == "SequelizeUniqueConstraintError"
        ) {
          let explanation = [];
          error.errors.forEach((err) => {
            explanation.push(err.message);
          });
          throw new AppError(explanation, StatusCodes.BAD_REQUEST);
        } else if (
          error.name === "SequelizeDatabaseError" &&
          error.original &&
          error.original.routine === "enum_in"
        ) {
          throw new AppError(
            "Invalid value for associate_with field.",
            StatusCodes.BAD_REQUEST
          );
        }
        throw new AppError(
          "Cannot get Product ",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function updateProduct(productId, newStock) {
  try {
    const product = await productRepository.update(productId, {
      stock:newStock
    });
    return product;
  } catch (error) {
    console.log(error);
    if(
        error.name == "SequelizeValidationError" ||
        error.name == "SequelizeUniqueConstraintError"
    ) {
      let explanation = [];
      error.errors.forEach((err) => {
        explanation.push(err.message);
      });
      throw new AppError(explanation, StatusCodes.BAD_REQUEST);
    } else if (
      error.name === "SequelizeDatabaseError" &&
      error.original &&
      error.original.routine === "enum_in"
    ) {
      throw new AppError(
        "Invalid value for associate_with field.",
        StatusCodes.BAD_REQUEST
      );
    }
    throw new AppError(
      "Cannot get Product ",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function reduceProductByQuantity(productId, stockData) {
  try {
    const product = await productRepository.update(productId, {
      stock:stockData
    });  
    return product;
  } catch (error) {
    console.log(error);
    if(
        error.name == "SequelizeValidationError" ||
        error.name == "SequelizeUniqueConstraintError"
    ) {
      let explanation = [];
      error.errors.forEach((err) => {
        explanation.push(err.message);
      });
      throw new AppError(explanation, StatusCodes.BAD_REQUEST);
    } else if (
      error.name === "SequelizeDatabaseError" &&
      error.original &&
      error.original.routine === "enum_in"
    ) {
      throw new AppError(
        "Invalid value for associate_with field.",
        StatusCodes.BAD_REQUEST
      );
    }
    throw new AppError(
      "Cannot update Product ",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
} 

async function getProductByNameAndCategory(name, category_id) {
 try {
  const product = await productRepository.getOne({
    where: {
      name, 
      category_id 
    }
  })
  return product || null;
 } catch (error) {
  console.log(error);
  if(
      error.name == "SequelizeValidationError" ||
      error.name == "SequelizeUniqueConstraintError"
  ) {
    let explanation = [];
    error.errors.forEach((err) => {
      explanation.push(err.message);
    });
    throw new AppError(explanation, StatusCodes.BAD_REQUEST);
  } else if (
    error.name === "SequelizeDatabaseError" &&
    error.original &&
    error.original.routine === "enum_in"
  ) {
    throw new AppError(
      "Invalid value for associate_with field.",
      StatusCodes.BAD_REQUEST
    );
  }
  throw new AppError(
    "Failed to retrieve product.",
    StatusCodes.INTERNAL_SERVER_ERROR
  );
 }
}

async function getProductCount(){
  try {
    const products = await productRepository.getAll();
    return products.length;
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Failed to retrieve product count.",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

// async function validateAndUpdateProducts(products){
//   const transaction = await sequelize.transaction(); 
//   try {
//     const results = [];
//     const updates = []; // Array to hold product updates for bulk operation
//     const inventoryDataArray = []; // Array to hold inventory transactions
    
//     for(const product of products){
//       const productData = await productRepository.get(product.id);
//       // console.log("Product data found", productData);
      
//       if(!productData){
//         throw new AppError(`Product ${product.id} not found.`, StatusCodes.NOT_FOUND);
//       }
//       let newQuantity;
//       if(product.transaction_type === "in" ) {
//         newQuantity = product.quantity + productData.stock;
//       } else if(product.transaction_type === "in"){
//         if(productData.stock < product.quantity){
//           throw new AppError(`Product ${product.name} is out of stock`, StatusCodes.BAD_REQUEST);
//         }
//         newQuantity = productData.stock - product.quantity;
//       }
//       console.log("new quantity", newQuantity);
      

//       updates.push({
//         id: product.id,
//         stock: newQuantity
//       });
//       inventoryDataArray.push({
//         product_id: product.id,
//         transaction_type: product.transaction_type,
//         quantity: product.quantity,
//         quantity_type: productData.quantity_type,
//         description: `${productData.name} was updated with ${product.quantity} with transaction '${product.transaction_type}' now the updated quantity is ${newQuantity}.`,
//         description_type: "text",
//         audio_path: null,
//       });
//     }

//       // const updatedProduct = await updateProduct(product.id, newQuantity);
//       // // product_id,
//       // // transaction_type,
//       // // quantity,
//       // // quantity_type,
//       // // description,
//       // // description_type,
//       // // audio_path
//       // const inventoryData = await inventoryTransactionRepository.create(
//       //   {
//       //     product_id: product.id,
//       //     transaction_type: product.transaction_type,
//       //     quantity: product.quantity,
//       //     quantity_type:productData.quantity_type,
//       //     description: `${productData.name} was updated with ${product.quantity} with transaction '${product.transaction_type}' now the updated quantity is ${newQuantity}.`,
//       //     description_type: "text",
//       //     audio_path: null,
//       //   }
//       // )

//       // results.push({
//       //   product_id: product.id,
//       //   new_stock: newQuantity,
//       //   transaction: inventoryData,
//       // });
//     // }

//     // Perform bulk update for products
//     await Promise.all(updates.map(({ id, newQuantity }) => productRepository.updateProductModel(id, newQuantity, { transaction })));

//     // Perform bulk create for inventory transactions
//     await inventoryTransactionRepository.bulkCreate(inventoryDataArray, { transaction });

//     // Commit the transaction
//     await transaction.commit();

//     // Prepare results
//     for (const product of products) {
//       const newQuantity = updates.find(update => update.id === product.id).stock;
//       results.push({
//           product_id: product.id,
//           new_stock: newQuantity,
//       });
//     }
//     return results;
//   } catch (error) {
//     await transaction.rollback();
//     console.log(error);
//     throw new AppError(
//       "Failed to validate and update products.",
//       StatusCodes.INTERNAL_SERVER_ERROR
//     );
//   }
// }

async function validateAndUpdateProducts(products) {
  const transaction = await sequelize.transaction();
  
  try {
    const results = [];
    const updates = [];
    const inventoryDataArray = [];

    // Fetch all products at once for better performance
    const productIds = products.map(product => product.id);
    const allProducts = await productRepository.findAllByIds(productIds, { transaction });
    
    // Create a map for easier lookup
    const productMap = new Map(allProducts.map(p => [p.id, p]));

    for (const product of products) {
      const productData = productMap.get(product.id);
      
      if (!productData) {
        throw new AppError(`Product ${product.id} not found.`, StatusCodes.NOT_FOUND);
      }

      let newQuantity;
      
      // Fixed the transaction type check
      if (product.transaction_type === "in") {
        newQuantity = Number(productData.stock) + Number(product.quantity);
      } else if (product.transaction_type === "out") {  // Changed from "in" to "out"
        if (Number(productData.stock) < Number(product.quantity)) {
          throw new AppError(
            `Product ${productData.name} is out of stock. Available: ${productData.stock}, Requested: ${product.quantity}`, 
            StatusCodes.BAD_REQUEST
          );
        }
        newQuantity = Number(productData.stock) - Number(product.quantity);
      }

      updates.push({
        id: product.id,
        stock: newQuantity
      });

      inventoryDataArray.push({
        product_id: product.id,
        transaction_type: product.transaction_type,
        quantity: product.quantity,
        quantity_type: productData.quantity_type,
        description: `${productData.name} was updated with ${product.quantity} with transaction '${product.transaction_type}' now the updated quantity is ${newQuantity}.`,
        description_type: "text",
        audio_path: null,
      });
    }

    // Bulk update products
    await productRepository.bulkUpdate(
      updates.map(update => ({
        id: update.id,
        stock: update.stock
      })), 
      { transaction }
    );

    // Create inventory transactions
    const inventoryRecords = await inventoryTransactionRepository.bulkCreate(
      inventoryDataArray, 
      { transaction }
    );

    // Commit transaction
    await transaction.commit();

    // Prepare results
    return updates.map((update, index) => ({
      product_id: update.id,
      new_stock: update.stock,
      transaction: inventoryRecords[index]
    }));

  } catch (error) {
    await transaction.rollback();
    console.error('Error in validateAndUpdateProducts:', error);
    throw new AppError(
      error.message || "Failed to validate and update products.",
      error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

module.exports = {
    createProduct,
    getProduct,
    getAllProducts,
    updateProduct,
    reduceProductByQuantity,
    getProductByNameAndCategory,
    getProductCount,
    validateAndUpdateProducts
}