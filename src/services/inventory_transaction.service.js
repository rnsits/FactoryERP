const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { InventoryTransactionRepository } = require("../repositories");
const { InventoryTransaction } = require("../models");
const { Op, where } = require("sequelize");

const inventoryTransactionRepository = new InventoryTransactionRepository();

async function createInventoryTransaction(data) {
    try{
        const inventory = await inventoryTransactionRepository.create(data);
        return inventory;
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
        "Cannot create a Inventory Data.",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
}

async function getInventoryTransaction(data) {
    try {
        const inventory = await inventoryTransactionRepository.get(data);
        return inventory;
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
          "Cannot get Invoice_Item associate with the field",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

// async function getAllInventoryTransactions(limit, offset, search, fields, filter) {
//     try {
   
//         const where = {};
        
//         if (search && fields.length > 0) {
//             where[Op.or] = fields.map(field => ({
//                 [field]: { [Op.like]: `%${search}%` }
//             }));
//         }

//           // Handle filtering
//           if (filter && typeof filter === 'string') {
//             const [key, value] = filter.split(':');
//             if (key && value) {
//                 where[key] = {[Op.like]: `%${value}%`};
//             }
//           }

//     const { count, rows } = await InventoryTransaction.findAndCountAll({
//       where,
//       attributes: fields.length > 0 ? fields : undefined,
//       limit,
//       offset,
//       order: [['createdAt', 'DESC']],
//     });
//   return { count, rows };
//     } catch(error) {
//         console.log(error);
//         if(
//             error.name == "SequelizeValidationError" ||
//             error.name == "SequelizeUniqueConstraintError"
//         ) {
//           let explanation = [];
//           error.errors.forEach((err) => {
//             explanation.push(err.message);
//           });
//           throw new AppError(explanation, StatusCodes.BAD_REQUEST);
//         } else if (
//           error.name === "SequelizeDatabaseError" &&
//           error.original &&
//           error.original.routine === "enum_in"
//         ) {
//           throw new AppError(
//             "Invalid value for associate_with field.",
//             StatusCodes.BAD_REQUEST
//           );
//         }
//         throw new AppError(
//           "Cannot get Inventory Transaction Data.",
//           StatusCodes.INTERNAL_SERVER_ERROR
//         );
//     }
// }

async function getAllInventoryTransactions(limit, offset, search, fields, filter) {
  try{
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
          'description',
          'transaction_type',
          'quantity',
          'quantity_type',
          'isManufactured',
          'isDamaged'
      ];

      searchableFields.forEach(field => {
          if (field in InventoryTransaction.rawAttributes) {
              // Handle numeric fields differently
              if (['quantity'].includes(field)) {
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
                      case 'quantity_type':
                          filterConditions.quantity_type = value;
                          break;
                      case 'transaction_type':
                        if(value === 'in'){
                          filterConditions.in = value;
                        } else if(value === 'out')
                          filterConditions.out = value
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

const { count, rows } = await InventoryTransaction.findAndCountAll(queryOptions);

// Transform the results to include calculated fields
const transformedRows = rows.map(inventory => {
    const plainInventoryTransactions = inventory.get({ plain: true });
    return {
        ...plainInventoryTransactions
    };
});

return {
    count,
    rows: transformedRows
};

  } catch(error) {
    console.error('Search error:', error);
    if (error instanceof AppError) {
        throw error;
    }
    throw new AppError(
        `Failed to fetch inventory transactions: ${error.message}`,
        StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function updateInventoryTransaction(inventoryTransactionId,data){
    try {
      const inventory = await inventoryTransactionRepository.update(inventoryTransactionId,data);
      return inventory;
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
        "Cannot get Inventory Transactions Data",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
  }

}

async function deleteInventoryTransaction(inventoryTransactionId) {
    try {
        const inventory = await inventoryTransactionRepository.destroy(inventoryTransactionId);
    }catch(error) {
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
          "Cannot get Inventory Transactions Data",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

// async function getDamagedProductsData(limit, offset, search, fields) {
//   try{

//     const where = { isDamaged: true };
//     if (search && fields.length > 0) {
//       where[Op.or] = fields.map(field => ({
//           [field]: { [Op.like]: `%${search}%` }
//       }));
//     }
//     const { count, rows } = await InventoryTransaction.findAndCountAll({
//       where,
//       limit,
//       offset,
//       order: [['createdAt', 'DESC']],
//     });
//     return { count, rows };
//   }catch(error){
//     console.log(error);
//         if(
//             error.name == "SequelizeValidationError" ||
//             error.name == "SequelizeUniqueConstraintError"
//         ) {
//           let explanation = [];
//           error.errors.forEach((err) => {
//             explanation.push(err.message);
//           });
//           throw new AppError(explanation, StatusCodes.BAD_REQUEST);
//         } else if (
//           error.name === "SequelizeDatabaseError" &&
//           error.original &&
//           error.original.routine === "enum_in"
//         ) {
//           throw new AppError(
//             "Invalid value for associate_with field.",
//             StatusCodes.BAD_REQUEST
//           );
//         }
//         throw new AppError(
//           "Cannot get Inventory Transactions Data",
//           StatusCodes.INTERNAL_SERVER_ERROR
//         );
//   }
// }

async function getDamagedProductsData(limit, offset, search, fields, filter) {
  try {
    // Base query options
    const queryOptions = {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : 0,
      order: [['createdAt', 'DESC']],
      include: [],
      where: {}
    };

    // Start building the where clause with the base condition
    let whereConditions = {
      isDamaged: true
    };

    // Handle search
    if (search) {
      const searchValue = search.toString().trim();
      const searchConditions = [];

      // Define searchable fields
      const searchableFields = fields?.length > 0 ? fields : [
        'description',
        'quantity',
        'quantity_type',
        'transaction_type'
      ];

      // Parse numeric search value
      const numericSearch = parseFloat(searchValue);

      searchableFields.forEach(field => {
        if (['description','quantity_type', 'transaction_type'].includes(field)) {
          // Handle string fields - using LIKE for MySQL
          searchConditions.push({
            [field]: {
              [Op.like]: `%${searchValue}%`
            }
          });
        } else if (['quantity'].includes(field) && !isNaN(numericSearch)) {
          searchConditions.push({
            [field]: numericSearch
          });
        }
      });

      // If we have search conditions, combine them with AND with the base condition
      if (searchConditions.length > 0) {
        whereConditions = {
          [Op.and]: [
            { isDamaged: true },
            { [Op.or]: searchConditions }
          ]
        };
      }
    }

    // Apply additional filters if provided
    if (filter && typeof filter === 'object') {
      whereConditions = {
        [Op.and]: [
          whereConditions,
          filter
        ]
      };
    }

    // Assign the final where conditions to queryOptions
    queryOptions.where = whereConditions;

    // Select specific fields if requested
    if (fields?.length > 0) {
      queryOptions.attributes = fields;
    }

    // Debug log
    console.log('Search value:', search);
    console.log('Final query options:', JSON.stringify(queryOptions, null, 2));

    const { count, rows } = await InventoryTransaction.findAndCountAll(queryOptions);
    const transformedRows = rows.map(inventory => inventory.get({ plain: true }));

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
      `Failed to fetch expenses: ${error.message}`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function getDamagedDataByDate(date, limit, offset, search, fields) {
  try{
    const where = { isDamaged: true };
    // Filter expenses by the specified date (date is already a Date object)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(24, 0, 0, 0);

    // Add the date filter to `where` clause
    where.createdAt = {
      [Op.gte]: startOfDay,
      [Op.lt]: endOfDay,
    };

    if (search && fields.length > 0) {
        where[Op.or] = fields.map(field => ({
            [field]: { [Op.like]: `%${search}%` }
        }));
    } 

    const { count, rows } = await InventoryTransaction.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
    return { count, rows };
  } catch(error){
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
          "Cannot get Inventory Transactions Data",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
  }
}


module.exports = {
    createInventoryTransaction,
    getInventoryTransaction,
    getAllInventoryTransactions,
    updateInventoryTransaction,
    deleteInventoryTransaction,
    getDamagedProductsData,
    getDamagedDataByDate
}