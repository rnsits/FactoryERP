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

async function addInvoiceItems(items, postOffice, invoiceId) {
  let totalInvoiceAmount = 0;
  const invoiceItems = [];

  for (const item of items) {
      const { item_name, quantity, unit_price } = item;
      const total_price = quantity * unit_price;

      let cgst_amount = 0, sgst_amount = 0, igst_amount = 0;

      // Calculate taxes based on the state
      if (postOffice && postOffice.State === "Rajasthan") {
          cgst_amount = 0.09 * total_price;
          sgst_amount = 0.09 * total_price;
          totalInvoiceAmount += total_price + cgst_amount + sgst_amount;
      } else {
          igst_amount = 0.18 * total_price;
          totalInvoiceAmount += total_price + igst_amount;
      }

      // Create each item associated with the invoice
      const invoiceItem = await invoiceItemRepository.create({
          invoice_id: invoiceId,
          item_name,
          quantity,
          unit_price,
          total_price,
          cgst_amount,
          sgst_amount,
          igst_amount,
      });

      invoiceItems.push(invoiceItem);
  }

  return invoiceItems;
}

async function updateInvoiceItem(itemId,data){
    try {
      const invoiceItem = await invoiceItemRepository.update(itemId,data);
      return invoiceItem;
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
    getAllInvoiceItems,
    addInvoiceItems,
    updateInvoiceItem
}