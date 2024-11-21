const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { InvoiceRepository } = require("../repositories");
const { Invoice } = require("../models");
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

async function getAllInvoices(limit, offset, search, fields) {
    try {

        const where = {};
        
        if (search && fields.length > 0) {
            where[Op.or] = fields.map(field => ({
                [field]: { [Op.like]: `%${search}%` }
            }));
        }

        // Handle filtering
        if (filter && typeof filter === 'string') {
          const [key, value] = filter.split(':');
          if (key && value) {
              where[key] = {[Op.like]: `%${value}%`};
          }
        }

    const { count, rows } = await Invoice.findAndCountAll({
      where,
      attributes: fields.length > 0 ? fields : undefined,
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
          "Cannot get Invoices. ",
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