const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { CustomersRepository } = require("../repositories");
const { Customers } = require("../models");
const { Op } = require("sequelize");

const customersRepository = new CustomersRepository();


async function createCustomer(data) {
    try{
        const customer = await customersRepository.create(data);
        return customer;
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
        "Cannot create a new customer",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
}

async function getCustomer(data) {
    try {
        const customer = await customersRepository.get(data);
        return customer;
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
          "Cannot get associated customer",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function getAllCustomers(limit, offset, search, fields, filter) {
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
           'mobile',
           'name',
           'mobile',
           'address',
           'email',
           'pincode'
       ];
     
       searchableFields.forEach(field => {
        if (['name', 'address', 'mobile', 'pincode', 'email'].includes(field)) {
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

    const { count, rows } = await Customers.findAndCountAll(queryOptions);

    const transformedRows = rows.map(customer => customer.get({ plain: true }));

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
          `Failed to fetch Customers: ${error.message}`,
          StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
}

async function updateCustomer(id, updateData) {
  try{
    const customer = await Customers.findByPk(id);
    return await customer.update(updateData);
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
    "Cannot create a new customer",
    StatusCodes.INTERNAL_SERVER_ERROR
  );
}
}

module.exports = {
    createCustomer,
    getCustomer,
    getAllCustomers,
    updateCustomer
}