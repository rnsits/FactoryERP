const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { InvoiceRepository } = require("../repositories");
const { Invoice, Customers } = require("../models");
const { Op } = require("sequelize");

const invoiceRepository = new InvoiceRepository();


async function createInvoice(data) {
    try{
        const invoice = await invoiceRepository.create(data);
        return invoice;
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
        "Cannot create a new Invoice",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
}

async function getInvoice(data) {
    try {
        const invoice = await invoiceRepository.get(data);
        return invoice;
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
          "Cannot get Invoice associate with the field",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

// async function getAllInvoices(limit, offset, search, fields, filter) {
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

//     const { count, rows } = await Invoice.findAndCountAll({
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
//           "Cannot get Invoices. ",
//           StatusCodes.INTERNAL_SERVER_ERROR
//         );
//     }
// }

async function getAllInvoices(limit, offset, search, fields, filter) {
  try {
      // Base query options
      const queryOptions = {
          limit,
          offset,
          order: [['createdAt', 'DESC']],
          include: [{
              model: Customers,
              as: 'customer',
              attributes: ['name', 'email', 'mobile', 'address', 'pincode']
          }]
      };

      // Handle search
      if (search && search.trim()) {
          const searchConditions = [];
          
          // Define searchable fields if none specified
          const searchableFields = fields.length > 0 ? fields : [
              'invoice_id',
              'payment_status',
              'payment_method',
              'pincode',
              'address',
              'mobile'
          ];

          // Add search conditions for Invoice fields
          searchableFields.forEach(field => {
              if (field in Invoice.rawAttributes) {
                  searchConditions.push({
                      [field]: { [Op.like]: `%${search.trim()}%` }
                  });
              }
          });

          // Add search conditions for Customer fields
          if (searchableFields.includes('customer_name')) {
              searchConditions.push({
                  '$Customer.name$': { [Op.like]: `%${search.trim()}%` }
              });
          }

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
                  if (value) {
                      // Handle date range filters
                      if (key === 'dateRange') {
                          filterConditions.createdAt = {
                              [Op.between]: [new Date(value.start), new Date(value.end)]
                          };
                      }
                      // Handle status filter
                      else if (key === 'payment_status') {
                          filterConditions.payment_status = value;
                      }
                      // Handle amount range filter
                      else if (key === 'amountRange') {
                          filterConditions.total_amount = {
                              [Op.between]: [value.min, value.max]
                          };
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

      const { count, rows } = await Invoice.findAndCountAll(queryOptions);

      return {
          count,
          rows: rows.map(invoice => {
              const plainInvoice = invoice.get({ plain: true });
              // Add any additional formatting here if needed
              return plainInvoice;
          })
      };

  } catch (error) {
      console.error('Search error:', error);
      if (error instanceof AppError) {
          throw error;
      }
      throw new AppError(
          `Failed to fetch invoices: ${error.message}`,
          StatusCodes.INTERNAL_SERVER_ERROR
      );
  }
}

async function getPendingInvoices() {
  try {
      const invoices = await invoiceRepository.getPendingInvoices();
      return invoices;
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
        "Cannot get Pending Invoices.",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
  }
}

async function getTodayInvoices(date, limit, offset, search, fields) {
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

    //  const invoices = await invoiceRepository.findToday();
      // return invoices;

      const { count, rows } = await invoiceRepository.findInvoicesByDate({
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
        "Cannot get Invoices created today.",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
  }
}

async function getInvoicesByDate(date, limit, offset, search, fields) {
  try{
   
    const where = {};
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(24, 0, 0, 0);

    where.createdAt = {
      [Op.gte]: startOfDay,
      [Op.lt]: endOfDay,
    };

    if (search && fields.length > 0) {
        where[Op.or] = fields.map(field => ({
            [field]: { [Op.like]: `%${search}%` }
        }));
    } 

    const { count, rows } = await Invoice.findAndCountAll({
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
          "Cannot get Invoice by date Data",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
  }
}

async function markInvoicePaid(id, amount, status, newAmount){
  try {
    const invoice = await invoiceRepository.update(id, {
      total_amount: amount,
      payment_status: status,
      due_amount: newAmount
    });
    return invoice;
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
        "Could not mark and update Invoice",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
}


module.exports = {
    createInvoice,
    getInvoice,
    getAllInvoices,
    getPendingInvoices,
    getTodayInvoices,
    getInvoicesByDate,
    markInvoicePaid
}