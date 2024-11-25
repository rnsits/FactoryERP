const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { VendorsRepository } = require("../repositories");
const { Vendors } = require("../models");
const { Op } = require("sequelize");

const vendorRepository = new VendorsRepository();

async function createVendor(data) {
    try{
        const vendor = await vendorRepository.create(data);
        return vendor;
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
        "Cannot create a new Vendor.",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
}

async function getVendor(data) {
    try {
        const vendor = await vendorRepository.get(data);
        return vendor;
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
          "Cannot get Vendor.",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

// async function getAllVendors(limit, offset, search, fields) {
//     try {
//         // const users = await vendorRepository.getAll();
//         // return users;

//         const where = {};
        
//         if (search && fields.length > 0) {
//             where[Op.or] = fields.map(field => ({
//                 [field]: { [Op.like]: `%${search}%` }
//             }));
//         }
//         const { count, rows } = await Vendors.findAndCountAll({
//           where,
//           limit,
//           offset,
//           order: [['createdAt', 'DESC']],
//         });
//       return { count, rows };
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
//           "Cannot get Vendor Object",
//           StatusCodes.INTERNAL_SERVER_ERROR
//         );
//     }
// }

async function getAllVendors(limit, offset, search, fields, filter) {
  try {
     // Base query options
     const queryOptions = {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : 0,
      order: [['createdAt', 'DESC']],
      include: [],
      where: {}
    };

     // Handle search
     if (search) {
      const searchValue = search.toString().trim();
      const searchConditions = [];
      
      // Define searchable fields
      const searchableFields = fields?.length > 0 ? fields : [
          'name',
          'address',
          'contact_person',
          'mobile',
          'pincode',
          'email',
      ];

      // Parse numeric search value
      const numericSearch = parseFloat(searchValue);

      searchableFields.forEach(field => {
      if (['mobile','pincode','address','contact_person','email','name'].includes(field)) {
              // Handle string fields - using LIKE for MySQL
              searchConditions.push({
                  [field]: {
                      [Op.like]: `%${searchValue}%`
                  }
              });
          }
      });

      if (searchConditions.length > 0) {
          queryOptions.where = {
              [Op.or]: searchConditions
          };
      }
  }

  // Apply additional filters if provided
  if (filter && typeof filter === 'object') {
    queryOptions.where = {
        ...queryOptions.where,
        ...filter
    };
}

// Select specific fields if requested
if (fields?.length > 0) {
    queryOptions.attributes = fields;
}

// Debug log
console.log('Search value:', search);
console.log('Final query options:', JSON.stringify(queryOptions, null, 2));

const { count, rows } = await Vendors.findAndCountAll(queryOptions);

const transformedRows = rows.map(vendor => vendor.get({ plain: true }));

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

module.exports = {
    createVendor,
    getVendor,
    getAllVendors
}