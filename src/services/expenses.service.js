const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { ExpensesRepository } = require("../repositories");
const { Expenses } = require("../models");
const { Op, Sequelize } = require("sequelize");

const expensesRepository = new ExpensesRepository();


async function createExpense(data) {
    try{
        const expense = await expensesRepository.create(data);
        return expense;
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
        "Cannot create a new expense",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
}

async function getExpense(data) {
    try {
        const expense = await expensesRepository.get(data);
        return expense;
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
          "Cannot get associated expense",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

// async function getAllExpenses(limit, offset, search, fields, filter) {
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

//     const { count, rows } = await Expenses.findAndCountAll({
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
//           "Cannot get Expenses ",
//           StatusCodes.INTERNAL_SERVER_ERROR
//         );
//     }
// }

async function getAllExpenses(limit, offset, search, fields, filter) {
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
                'total_cost',
                'description',
                'payment_status'
            ];

            // Parse numeric search value
            const numericSearch = parseFloat(searchValue);

            searchableFields.forEach(field => {
                if (field === 'total_cost' && !isNaN(numericSearch)) {
                    // Handle total_cost with exact and range search
                    searchConditions.push({
                        total_cost: {
                            [Op.or]: [
                                numericSearch,  // Exact match
                                {
                                    [Op.between]: [
                                        numericSearch - 0.01, 
                                        numericSearch + 0.01
                                    ]
                                }
                            ]
                        }
                    });
                } else if (['description','payment_status'].includes(field)) {
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

        const { count, rows } = await Expenses.findAndCountAll(queryOptions);

        const transformedRows = rows.map(expense => expense.get({ plain: true }));

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


async function getTodayExpenses(limit, offset, search, fields) {
  try {
    const where = {};
        
    if (search && fields.length > 0) {
        where[Op.or] = fields.map(field => ({
            [field]: { [Op.like]: `%${search}%` }
        }));
    }
      const { count, rows } = await expensesRepository.findToday({
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
        "Cannot get Expenses.",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
  }
}

async function getExpensesByDate(date, limit, offset, search, fields) {
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

      // If search query and fields are provided, add the search condition
      if (search && fields.length > 0) {
        where[Op.or] = fields.map((field) => ({
          [field]: { [Op.like]: `%${search}%` }
        }));
      } 
      // const expenses = await expensesRepository.findAll(date);
      // return expenses;
      // Fetch expenses from the database with pagination
      const { count, rows } = await expensesRepository.findExpensesByDate({
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
        "Cannot get Expenses.",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
  }
}

async function getUnpaidExpenses(limit, offset, search, fields){
  try {
    const where = { 
      payment_status: {
        [Op.notIn]: ['paid'],
      }
    };

      // If search query and fields are provided, add the search condition
      if (search && fields.length > 0) {
        where[Op.or] = fields.map((field) => ({
          [field]: { [Op.like]: `%${search}%` }
        }));
      } 

      const { count, rows } = await Expenses.findAndCountAll({
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
        "Cannot get Unpaid Expenses.",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
  }
}

async function markExpensePaid(id, amount, status, newAmount) {
  try {
    const expense = await expensesRepository.update(id, {
      total_cost: amount,
      payment_status: status,
      due_amount: newAmount
    });
     return expense;
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
        "Could not mark and update Expense",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
}

module.exports = {
    createExpense,
    getExpense,
    getAllExpenses,
    getTodayExpenses,
    getExpensesByDate,
    getUnpaidExpenses, 
    markExpensePaid
}