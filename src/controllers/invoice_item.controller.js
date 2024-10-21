const { StatusCodes } = require("http-status-codes");
const { Invoice_ItemService, ProductService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");

async function addInvoiceItem(req, res) {
    try {
        const { product_id, quantity, quantity_type, unit_price, name, item_image, cgst_rate, igst_rate, sgst_rate  } = req.body;

         // Initialize invoice item details
         let invoiceItemData = {
            cgst_rate,
            igst_rate,
            sgst_rate,
            name,
            unit_price,
            quantity,
            quantity_type,
            item_image
        };
       
        if(product_id) {
            const product = await ProductService.getProduct(product_id);
            if (!product) {
                ErrorResponse.message = "Product not found";
                return res.status(StatusCodes.NOT_FOUND).json(ErrorResponse);
            }

            // Use product data to fill in missing fields
            invoiceItemData = {
                ...invoiceItemData,
                name: product.name,
                product_id: product_id, // Link the product to the invoice item
                item_image: item_image || product.product_image // Use product's image if not provided
            };

        }
        const item = await Invoice_ItemService.createInvoice_Item(invoiceItemData);
        SuccessResponse.message = "Invoice Item added successfully";
        SuccessResponse.data = item;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.message = "Failed to add Invoice Item.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
    
}

// async function addInvoiceItems(items, postOffice, invoiceId) {
//     let totalInvoiceAmount = 0;
//     const invoiceItems = [];

//     for (const item of items) {
//         const { item_name, quantity, unit_price } = item;
//         const total_price = quantity * unit_price;

//         let cgst_amount = 0, sgst_amount = 0, igst_amount = 0;

//         // Calculate taxes based on the state
//         if (postOffice && postOffice.State === "Rajasthan") {
//             cgst_amount = 0.09 * total_price;
//             sgst_amount = 0.09 * total_price;
//             totalInvoiceAmount += total_price + cgst_amount + sgst_amount;
//         } else {
//             igst_amount = 0.18 * total_price;
//             totalInvoiceAmount += total_price + igst_amount;
//         }

//         // Create each item associated with the invoice
//         const invoiceItem = await InvoiceItem.create({
//             invoice_id: invoiceId,
//             item_name,
//             quantity,
//             unit_price,
//             total_price,
//             cgst_amount,
//             sgst_amount,
//             igst_amount,
//         });

//         invoiceItems.push(invoiceItem);
//     }

//     return invoiceItems;
// }


async function getInvoiceItem(req,res){
    try{
        const item = await Invoice_ItemService.getInvoiceItem(req.params.invoiceItemId);
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = item;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse) 
    } catch (error) {
        console.log(error);
        ErrorResponse.message = "Something went wrong while getting Item";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}

async function getAllInvoiceItems(req, res){
    try{
        const items = await Invoice_ItemService.getAllInvoiceItems(); 
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = items;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse)
    }catch(error) {
        console.log(error);
        ErrorResponse.message = "Something went wrong while getting Invoice Items";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}


module.exports = {
    addInvoiceItem,
    // addInvoiceItems,
    getInvoiceItem,
    getAllInvoiceItems
}