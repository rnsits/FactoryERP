const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { InvoiceRepository } = require("../repositories");
const { Invoice, Customers, User } = require("../models");
const { Op, where } = require("sequelize");

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
        const invoice = await Invoice.findOne({
          where: { id: data},
          include: [
            {
              model: Customers,
              as: 'customer',
              attributes: ['name'],
            },
            {
              model: User,
              as: 'user',
              attributes: ['username', 'phone', 'gstin', 'company_name', 'address', 'logo', 'pincode'],
            }
          ]
        });
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

async function getAllInvoices(limit, offset, search, fields, filter) {
  try {
      // Base query options need to look why customers fields aren't searchable
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
              'mobile',
              'customer.name',
              'customer.email',
              'customer.mobile',
              'customer.address',
              'customer.pincode'
          ];

          // Add search conditions for Invoice fields
          searchableFields.forEach(field => {
            if (field.includes('customer.')) {
              // Handle customer fields
              const customerField = field.split('.')[1];
              searchConditions.push({
                  ['$customer.' + customerField + '$']: { 
                      [Op.like]: `%${search.trim()}%` 
                  }
              });
            } else if (field in Invoice.rawAttributes) {
              // Handle invoice fields
              searchConditions.push({
                  [field]: { 
                      [Op.like]: `%${search.trim()}%` 
                  }
              });
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
                      // Handle customer filters
                      else if (key.startsWith('customer_')) {
                          const customerField = key.replace('customer_', '');
                          filterConditions[`$customer.${customerField}$`] = value;
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

//need to add total amount
async function getPendingInvoices() {
  try {
      const invoices = await invoiceRepository.getPendingInvoices();
      const unpaidTotalAmount = invoices.reduce((sum, invoice) => sum + (invoice.due_amount || 0), 0);
      return { invoices, unpaidTotalAmount };
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

    // where.createdAt = {
    //   [Op.gte]: startOfDay,
    //   [Op.lt]: endOfDay,
    // };

    where[Op.or] = [
      {
        createdAt: {
          [Op.gte]: startOfDay,
          [Op.lt]: endOfDay,
        }
      },
      {
        due_date: {
          [Op.gte]: startOfDay,
          [Op.lt]: endOfDay,
        }
      },
    ];

    if (search && fields.length > 0) {
        where[Op.or] = fields.map(field => ({
            [field]: { [Op.like]: `%${search}%` }
        }));
    } 

    const { count, rows } = await Invoice.findAndCountAll({
      where,
      limit,
      offset,
      order: [
        ['due_date', 'DESC'],
        ['createdAt', 'DESC']
      ],
      include: [{
        model: Customers,
        as: 'customer',
        attributes: ['name']
      }]
    });

    const totalAmount = await Invoice.sum('total_amount', {where});
    return { count, rows, totalAmount };
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

async function markInvoicePaid(id, status, finalDueAmount){
  try {
    const invoice = await invoiceRepository.update(id, {
      payment_status: status,
      due_amount: finalDueAmount
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

async function getInvoicesByMonth(date, limit = 10, offset = 0, search = '', fields = []) {
  try {
    // Ensure date is a valid Date object
    const inputDate = new Date(date);
    
    // Set start of the month (first day at 00:00:00)
    const startOfMonth = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1, 0, 0, 0, 0);
    
    // Set end of the month (last day at 23:59:59)
    const endOfMonth = new Date(inputDate.getFullYear(), inputDate.getMonth() + 1, 0, 23, 59, 59, 999);

    // Construct where clause
    const where = {
      createdAt: {
        [Op.gte]: startOfMonth,
        [Op.lt]: endOfMonth,
      }
    };

    // Add search conditions if search term and fields are provided
    if (search && fields.length > 0) {
      where[Op.or] = fields.map(field => ({
        [field]: { [Op.like]: `%${search}%` }
      }));
    }

    // Find and count invoices
    const { count, rows } = await Invoice.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    // Calculate total amount for the month
    const totalAmount = await Invoice.sum('total_amount', { where });

    return { 
      count,       // Total number of invoices
      rows,        // Invoices for the page
      totalAmount, // Total amount of invoices for the month
      startOfMonth, // Start date of the month
      endOfMonth    // End date of the month
    };
  } catch (error) {
    console.error('Error in getInvoicesByMonth:', error);

    // Handle specific Sequelize errors
    if (error.name === "SequelizeValidationError" || 
        error.name === "SequelizeUniqueConstraintError") {
      const explanation = error.errors.map(err => err.message);
      throw new AppError(explanation, StatusCodes.BAD_REQUEST);
    }

    if (error.name === "SequelizeDatabaseError" && 
        error.original && 
        error.original.routine === "enum_in") {
      throw new AppError(
        "Invalid value for associate_with field.",
        StatusCodes.BAD_REQUEST
      );
    }

    // Generic error for any other issues
    throw new AppError(
      "Cannot retrieve invoices for the specified month",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function updateImage(id, payment_image, options) {
  try {
    const response = await invoiceRepository.update(id, {payment_image}, options);
    return response;
  } catch (error) {
    console.error('Error:', error);
    throw new AppError(
      error.message || "Failed to update invoice image.",
      error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
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
    markInvoicePaid,
    getInvoicesByMonth,
    updateImage
}