const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { PurchasesRepository } = require("../repositories");
const { Purchases, Vendors, Product } = require("../models");
const { Op } = require("sequelize");

const purchaseRepository = new PurchasesRepository();


async function createPurchase(data) {
    try{
        const purchase = await purchaseRepository.create(data);
        return purchase;
      }catch(error){
        console.log("Purchase creation error:", error);
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
        "Cannot create a new Purchase",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
}

async function getPurchase(data) {
    try {
        const purchase = await purchaseRepository.get(data);
        return purchase;
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
          "Cannot get Purchase associate with the field",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

// async function getAllPurchases(limit, offset, search, fields, filter) {
//     try {

//         const where = {};
        
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
    
//         const { count, rows } = await Purchases.findAndCountAll({
//           where,
//           attributes: fields.length > 0 ? fields : undefined,
//           limit, 
//           offset,
//           order: [['createdAt', 'DESC']],
//         });
//         return { count, rows };
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
//           "Cannot get Purchases ",
//           StatusCodes.INTERNAL_SERVER_ERROR
//         );
//     }
// }

async function getAllPurchases(limit, offset, search, fields, filter) {
  try {
      const where = {};
      const include = [];

      // Basic search on Purchase fields
      if (search && fields.length > 0) {
          const searchConditions = fields.map(field => {
              // Handle numeric fields differently
              if (['quantity', 'total_cost'].includes(field)) {
                  // Only apply numeric search if the search term is a number
                  return !isNaN(search) ? {
                      [field]: search
                  } : null;
              }
              // Handle date fields
              else if (['payment_date', 'payment_due_date'].includes(field)) {
                  return {
                      [field]: {
                          [Op.like]: `%${search}%`
                      }
                  };
              }
              // Handle enum fields
              else if (['payment_status', 'quantity_type'].includes(field)) {
                  return {
                      [field]: {
                          [Op.like]: `%${search.toLowerCase()}%`
                      }
                  };
              }
              // Default string search
              return {
                  [field]: {
                      [Op.like]: `%${search}%`
                  }
              };
          }).filter(condition => condition !== null);

          where[Op.or] = searchConditions;
      }

      // Handle filtering
      if (filter && typeof filter === 'string') {
          const [key, value] = filter.split(':');
          if (key && value) {
              // Handle special filter cases
              switch (key) {
                  case 'vendor_name':
                      include.push({
                          model: Vendors,
                          as: 'vendor',
                          where: {
                              name: { [Op.like]: `%${value}%` }
                          }
                      });
                      break;
                  case 'product_name':
                      include.push({
                          model: Product,
                          as: 'product',
                          where: {
                              name: { [Op.like]: `%${value}%` }
                          }
                      });
                      break;
                  case 'price_range':
                      const [min, max] = value.split('-');
                      if (min && max) {
                          where.total_cost = {
                              [Op.between]: [parseFloat(min), parseFloat(max)]
                          };
                      }
                      break;
                  case 'date_range':
                      const [startDate, endDate] = value.split('-');
                      if (startDate && endDate) {
                          where.payment_date = {
                              [Op.between]: [new Date(startDate), new Date(endDate)]
                          };
                      }
                      break;
                  default:
                      where[key] = { [Op.like]: `%${value}%` };
              }
          }
      }

      // Always include relations unless specifically excluded
      if (!include.find(inc => inc.as === 'vendor')) {
          include.push({
              model: Vendors,
              as: 'vendor',
              attributes: ['id', 'name']  // Only include essential fields
          });
      }
      if (!include.find(inc => inc.as === 'product')) {
          include.push({
              model: Product,
              as: 'product',
              attributes: ['id', 'name']  // Only include essential fields
          });
      }

      const { count, rows } = await Purchases.findAndCountAll({
          where,
          include,
          attributes: fields.length > 0 ? fields : undefined,
          limit: limit ? parseInt(limit) : undefined,
          offset: offset ? parseInt(offset) : 0,
          order: [['createdAt', 'DESC']],
          distinct: true  // Important when using includes to get accurate count
      });

      return {
          count,
          rows,
          currentPage: offset ? Math.floor(offset / limit) + 1 : 1,
          totalPages: limit ? Math.ceil(count / limit) : 1
      };
  } catch (error) {
      console.error('Purchase search error:', error);
      if (
          error.name === "SequelizeValidationError" ||
          error.name === "SequelizeUniqueConstraintError"
      ) {
          const explanation = error.errors.map(err => err.message);
          throw new AppError(explanation, StatusCodes.BAD_REQUEST);
      } else if (
          error.name === "SequelizeDatabaseError" &&
          error.original?.routine === "enum_in"
      ) {
          throw new AppError(
              "Invalid value for enum field",
              StatusCodes.BAD_REQUEST
          );
      }
      throw new AppError(
          "Cannot get Purchases",
          StatusCodes.INTERNAL_SERVER_ERROR
      );
  }
}

async function getTodayPurchases(limit, offset, search, fields) {
  try {
      const where = {};
        
      if (search && fields.length > 0) {
          where[Op.or] = fields.map(field => ({
              [field]: { [Op.like]: `%${search}%` }
          }));
      }

      const { count, rows } = await purchaseRepository.findToday({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });
      // return expenses;
      return { count, rows };
      
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
        "Cannot get Purchases. ",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
  }
}

async function getPurchasesByDate(date, limit, offset, search, fields) {
  try {   
      const where = {};

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

      // const purchases = await purchaseRepository.findAll(date);
      // return purchases;
      const { count, rows } = await purchaseRepository.findPurchasesByDate({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      return { count, rows };
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
        "Cannot get Purchases. ",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
  }
}
async function getUnPaidPurchases(limit, offset, search, fields) {
  try {
    const where = { 
      payment_status: {
        [Op.notIn]: ['paid']
      }
    };
    if (search && fields.length > 0) {
      where[Op.or] = fields.map(field => ({
          [field]: { [Op.like]: `%${search}%` }
      }));
    }
    const { count, rows } = await Purchases.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
    return { count, rows };
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
      "Cannot get Purchases. ",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
    }
}

module.exports = {
    createPurchase,
    getPurchase,
    getAllPurchases,
    getTodayPurchases,
    getPurchasesByDate,
    getUnPaidPurchases
}