const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { Invoice_ItemRepository } = require("../repositories");

const invoiceItemRepository = new Invoice_ItemRepository();


async function createInvoice_Item(data) {
    try{
        const invoice_item = await invoiceItemRepository.create(data);
        return invoice_item;
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
        "Cannot create a new Invoice_Item.",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
}

async function getInvoiceItem(data) {
    try {
        const invoice = await invoiceItemRepository.get(data);
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
          "Cannot get Invoice_Item associate with the field",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function getAllInvoiceItems() {
    try {
        const invoices = await invoiceItemRepository.getAll();
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
          "Cannot get Invoice Items",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

module.exports = {
    createInvoice_Item,
    getInvoiceItem,
    getAllInvoiceItems
}