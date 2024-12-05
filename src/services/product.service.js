const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { ProductRepository, InventoryTransactionRepository } = require("../repositories");
const { SuccessResponse } = require("../utils/common");
const {sequelize} = require("../models");
const { Product } = require("../models");
const { Op } = require("sequelize");

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

// async function getAllProducts(limit, offset, search, fields, filter) {
//   try {

//     const where = {};
        
//         if (search && fields.length > 0) {
//             where[Op.or] = fields.map(field => ({
//                 [field]: { [Op.like]: `%${search}%` }
//             }));
//         }

//         // Handle filtering
//         if (filter && typeof filter === 'string') {
//           const [key, value] = filter.split(':');
//           if (key && value) {
//               where[key] = {[Op.like]: `%${value}%`};
//           }
//         }

//     const { count, rows } = await Product.findAndCountAll({
//       where,
//       attributes: fields.length > 0 ? fields : undefined,
//       limit,
//       offset,
//       order: [['createdAt', 'DESC']],
//     });
//   return { count, rows };
//   } catch (error) {
//     console.log(error);
//             if(
//                 error.name == "SequelizeValidationError" ||
//                 error.name == "SequelizeUniqueConstraintError"
//             ) {
//               let explanation = [];
//               error.errors.forEach((err) => {
//                 explanation.push(err.message);
//               });
//               throw new AppError(explanation, StatusCodes.BAD_REQUEST);
//             } else if (
//               error.name === "SequelizeDatabaseError" &&
//               error.original &&
//               error.original.routine === "enum_in"
//             ) {
//               throw new AppError(
//                 "Invalid value for associate_with field.",
//                 StatusCodes.BAD_REQUEST
//               );
//             }
//             throw new AppError(
//               "Cannot get Product ",
//               StatusCodes.INTERNAL_SERVER_ERROR
//             );
//   }
// }

async function getAllProducts(limit, offset, search, fields, filter) {
  try {
      // Base query options
      const queryOptions = {
          limit,
          offset,
          order: [['createdAt', 'DESC']],
          include: []
      };

      // Handle search
      if (search && search.trim()) {
          const searchConditions = [];
          
          // Define searchable fields if none specified
          const searchableFields = fields.length > 0 ? fields : [
              'name',
              'description',
              'quantity_type',
              'stock',
              'product_cost'
          ];

          searchableFields.forEach(field => {
              if (field in Product.rawAttributes) {
                  // Handle numeric fields differently
                  if (['stock', 'product_cost', 'cgst_rate', 'sgst_rate', 'igst_rate'].includes(field)) {
                      if (!isNaN(search)) {
                          searchConditions.push({
                              [field]: search
                          });
                      }
                  } else {
                      searchConditions.push({
                          [field]: { [Op.like]: `%${search.trim()}%` }
                      });
                  }
              }
          });

          queryOptions.where = {
              [Op.or]: searchConditions
          };
      }

      // Handle filtering
      if (filter) {
          try {
              const filters = typeof filter === 'string' ? JSON.parse(filter) : filter;
              const filterConditions = {};

              Object.entries(filters).forEach(([key, value]) => {
                  if (value !== undefined && value !== null) {
                      switch(key) {
                          case 'priceRange':
                              filterConditions.product_cost = {
                                  [Op.between]: [value.min, value.max]
                              };
                              break;
                          case 'stockRange':
                              filterConditions.stock = {
                                  [Op.between]: [value.min, value.max]
                              };
                              break;
                          case 'quantity_type':
                              filterConditions.quantity_type = value;
                              break;
                          case 'isManufactured':
                              filterConditions.isManufactured = value;
                              break;
                          case 'description_type':
                              filterConditions.description_type = value;
                              break;
                          case 'stockStatus':
                              if (value === 'inStock') {
                                  filterConditions.stock = {
                                      [Op.gt]: 0
                                  };
                              } else if (value === 'outOfStock') {
                                  filterConditions.stock = {
                                      [Op.eq]: 0
                                  };
                              }
                              break;
                          case 'taxRate':
                              // Search by total tax rate (CGST + SGST + IGST)
                              filterConditions[Op.or] = [
                                  { cgst_rate: value },
                                  { sgst_rate: value },
                                  { igst_rate: value }
                              ];
                              break;
                      }
                  }
              });

              queryOptions.where = {
                  ...queryOptions.where,
                  ...filterConditions
              };
          } catch (error) {
              console.error('Filter parsing error:', error);
              throw new AppError('Invalid filter format', StatusCodes.BAD_REQUEST);
          }
      }

      // Select specific fields if requested
      if (fields.length > 0) {
          queryOptions.attributes = fields;
      }

      console.log('Final query options:', JSON.stringify(queryOptions, null, 2));

      const { count, rows } = await Product.findAndCountAll(queryOptions);

      // Transform the results to include calculated fields
      const transformedRows = rows.map(product => {
          const plainProduct = product.get({ plain: true });
          return {
              ...plainProduct,
              total_tax_rate: (
                  (plainProduct.cgst_rate || 0) + 
                  (plainProduct.sgst_rate || 0) + 
                  (plainProduct.igst_rate || 0)
              ).toFixed(2),
              stock_status: plainProduct.stock > 0 ? 'In Stock' : 'Out of Stock'
          };
      });

      return {
          count,
          rows: transformedRows
      };

  } catch (error) {
      console.error('Search error:', error);
      if (error instanceof AppError) {
          throw error;
      }
      throw new AppError(
          `Failed to fetch products: ${error.message}`,
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

async function getProductByName(name) {
 try {
  const product = await Product.findOne({
    where: {
      name
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

async function getProductsByIds(ids, options = {}) {
  return await Product.findAll({
      where: {
          id: {
              [Op.in]: ids
          }
      },
      ...options
  });
}

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

async function updateImage(product_id, product_image, options){
  try {
    const response = await productRepository.update(product_id, {product_image}, options);
    return response;
  } catch (error) {
    console.error('Error in validateAndUpdateProducts:', error);
    throw new AppError(
      error.message || "Failed to validate and update products.",
      error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function getProductByHSN(hsn_code) {
  try {
    const product = await Product.findOne({
      where: {
        hsn_code
      }
    })
    return product || null;
  } catch (error) {
    console.error('Error in HSN check :', error);
    throw new AppError(
      error.message || "Failed to fetch product.",
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
    getProductByName,
    getProductCount,
    validateAndUpdateProducts,
    getProductsByIds,
    updateImage,
    getProductByHSN
}