const { StatusCodes } = require("http-status-codes");
const { ProductService, InventoryTransactionService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { Product } = require("../models");
const { sequelize } = require("../models");
const AppError = require("../utils/errors/app.error");
const { text } = require("body-parser");

async function addProduct(req, res) {
    const transaction = await sequelize.transaction();
    try {
        const { 
            name, 
            description, 
            description_type, 
            quantity_type, 
            stock, 
            product_cost, 
            // product_image, 
            isManufactured,
            hsncode,
            tax
        } = req.body;

        let product_image = req.file ? `/uploads/images/${req.file.filename}`: null;
         // Parse numeric values
        const parsedStock = Number(req.body.stock) || 0; // Default to 0 if parsing fails
        const parsedProductCost = parseFloat(req.body.product_cost) || 0; // Handle decimal numbers
        const existingProduct = await ProductService.getProductByName(name, {transaction});
        // const currentTime = new Date().toLocaleString();
        let product, updatedInventory;
        const cgst_rate = parseFloat(tax/2);
        const sgst_rate = parseFloat(tax/2);
        const igst_rate = parseFloat(tax);
        

        if (isManufactured == true) {
            if (existingProduct) {
                const newStock = existingProduct.stock + parsedStock;
                product = await ProductService.updateProduct(existingProduct.id, newStock, {transaction});
                
                updatedInventory = await InventoryTransactionService.createInventoryTransaction({
                    product_id: existingProduct.id,
                    transaction_type: 'in',
                    quantity: parsedStock,
                    quantity_type: existingProduct.quantity_type,
                    description: `${existingProduct.name}`,
                    description_type: 'text',
                    isManufactured: true
                },{transaction});
            } else {
                // Create new manufactured product
                // Parse numeric values
                // const stock = Number(req.body.stock) || 0; // Default to 0 if parsing fails
                // const product_cost = parseFloat(req.body.product_cost) || 0; // Handle decimal numbers
                
                product = await ProductService.createProduct({
                    name,
                    description,
                    description_type,
                    quantity_type,
                    stock: parsedStock,
                    product_cost: parsedProductCost,
                    cgst_rate,
                    sgst_rate,
                    igst_rate,
                    hsn_code: hsncode,
                    isManufactured: true
                },{transaction});

                updatedInventory = await InventoryTransactionService.createInventoryTransaction({
                    product_id: product.id,
                    transaction_type: 'in',
                    quantity: parsedStock,
                    quantity_type: product.quantity_type,
                    description: `${product.name}`,
                    description_type: 'text',
                    isManufactured: true
                }, {transaction});
            }
        } 
        else {
            
            if (existingProduct) {
                throw new AppError(["Product with this name already exists."], StatusCodes.CONFLICT);
            }
            product = await ProductService.createProduct({
                name,
                description,
                description_type,
                quantity_type,
                stock: parsedStock,
                product_cost: parsedProductCost,
                product_image,
                cgst_rate,
                igst_rate,
                sgst_rate,
                hsn_code: hsncode,
                isManufactured: true
            }, {transaction});

            updatedInventory = await InventoryTransactionService.createInventoryTransaction({
                product_id: product.id,
                transaction_type: 'in',
                quantity: parsedStock,
                quantity_type: product.quantity_type,
                description: `${product.name}`,
                description_type: 'text',
                isManufactured: true
            },{transaction});
        }
        
        await transaction.commit();

        SuccessResponse.message = "Product added successfully";
        SuccessResponse.data = { product, updatedInventory };
        return res.status(StatusCodes.CREATED).json(SuccessResponse);

    } catch (error) {
        console.log(error);
        await transaction.rollback();
        ErrorResponse.message = "Failed to add product.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}


async function getProduct(req, res) {
    try{
        const product = await ProductService.getProduct(req.params.productId);
        SuccessResponse.message = "Product fetched Successfully.";
        SuccessResponse.data = product;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    }catch(error){
        console.log(error);
        ErrorResponse.message = "Failed to fetch product.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

async function getProducts(req, res) {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 12;
        const offset = (page - 1) * limit; 
        const search = req.query.search || '';
        const fields = req.query.fields ? req.query.fields.split(',') : [];
        const filter = req.query.filter || null;

        const { count, rows } = await ProductService.getAllProducts(limit, offset, search, fields, filter);

        SuccessResponse.message = "Products retrieved successfully.";
        SuccessResponse.data = {
            products: rows,
            totalCount: count, 
            totalPages: Math.ceil(count / limit), 
            currentPage: page,
            pageSize: limit
        };
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        console.log(error);
        ErrorResponse.message = "Failed to fetch products.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

async function reduceProduct(req, res) {
    const transaction = await sequelize.transaction();
    try {
        const productId = req.params.productId;
        const quantity = req.body.quantity;
        const product = await ProductService.getProduct(productId, {transaction});
        
        if(!product) {
            ErrorResponse.message = "Product not found";
            return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }

        let changeStock = product.stock - quantity;
        
        if(changeStock < 0) {
            ErrorResponse.message = "Quantity provided would result in negative stock";
            return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }
        const updatedProduct = await ProductService.reduceProductByQuantity(productId, changeStock, {transaction});
        const currentTime = new Date().toLocaleString(); 
        const inventoryData = {
            product_id: productId,
            transaction_type: 'out',
            quantity: quantity,
            quantity_type: product.quantity_type,
            description: `${product.name}`,
            description_type: 'text',
        };
        const logData = await InventoryTransactionService.createInventoryTransaction(inventoryData,{transaction});
        await transaction.commit();
        
        SuccessResponse.message = "Product reduced successfully.";
        SuccessResponse.data = {updatedProduct, logData};
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        console.log(error);
        await transaction.rollback();
        ErrorResponse.message = "Failed to remove products.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

async function updateProductByQuantity(req, res) {
    const transaction = await sequelize.transaction();
    try {
        const { quantity, transaction_type } = req.body; 
        const { productId } = req.params;

        // Perform product update and retrieve the updated product in one step
        const product = await ProductService.getProduct(productId, {transaction});
        if (!product || quantity == 0) {
            ErrorResponse.message = "Product not found or Quantity cannot be 0";
            await transaction.rollback();
            return res.status(StatusCodes.NOT_FOUND).json(ErrorResponse);
        }

        const currentStock = product.stock;
        const newStock = (transaction_type === 'in') ? currentStock + quantity : currentStock - quantity;

        if (newStock < 0) {
            ErrorResponse.message = "Quantity provided would result in negative stock";
            await transaction.rollback();
            return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }
        
        // const currentTime = new Date().toLocaleString(); 
        const description = (transaction_type === 'in') ? `${product.name}` : `${product.name}`;

        // Perform product stock update and inventory log within a transaction
        // const [updatedProduct, updatedInventory] = await Promise.all([
        //     ProductService.updateProduct(productId, newStock),
        //     InventoryTransactionService.createInventoryTransaction({
        //         product_id: productId,
        //         transaction_type,
        //         quantity,
        //         quantity_type: product.quantity_type,
        //         description,
        //         description_type: 'text'
        //     })
        // ]);
        const updatedProduct = await ProductService.updProduct(productId, newStock, {transaction});
        const updatedInventory = await InventoryTransactionService.createInventoryTransaction({
            product_id: productId,
            transaction_type,
            quantity,
            quantity_type: product.quantity_type,
            description,
            description_type: 'text'
        }, {transaction});

        await transaction.commit();

        SuccessResponse.message = "Product updated successfully.";
        SuccessResponse.data = { updatedProduct, updatedInventory };
        return res.status(StatusCodes.OK).json(SuccessResponse);

    } catch (error) {
        console.log(error);
        await transaction.rollback();
        ErrorResponse.message = "Failed to update products.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

async function validateAndUpdateProducts(req, res){
    try{
        const { products } = req.body;
        const validatedProducts = await ProductService.validateAndUpdateProducts(products);
        SuccessResponse.message = "Products updated successfully.";
        SuccessResponse.data = validatedProducts;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    }catch(error){
        console.log(error);
        ErrorResponse.message = "Failed to update products.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

async function getProductCount(req, res){
    try {
        const productCount = await ProductService.getProductCount();
        SuccessResponse.message = "Product count fetched successfully.";
        SuccessResponse.data = {productCount};
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        console.log(error);
        ErrorResponse.message = "Failed to fetch product count.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

async function damagedProducts(req, res){
    const t = await sequelize.transaction();
    try {
        // const { products, description_type } = req.body;
        const { product_id, quantity, description, description_type } = req.body;
        let audio_path = req.file ? `/uploads/audio/${req.file.filename}`: null;

        // Fetch product details
        const product = await Product.findByPk(product_id, { transaction: t });
        if (!product) {
            ErrorResponse.message = `Product with ID ${product_id} does not exist`;
            await t.rollback();
            return res.status(StatusCodes.NOT_FOUND).json(ErrorResponse);
        }

        // Validate quantity
        if (quantity <= 0) {
            ErrorResponse.message = `Quantity must be greater than 0 for product ${product.name}`;
            await t.rollback();
            return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }
        if (quantity > product.stock) {
            ErrorResponse.message = `Insufficient stock for product ${product.name}. Available: ${product.stock}`;
            await t.rollback();
            return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }

        // Calculate new stock and create inventory transaction
        const newStock = product.stock - quantity;

        const inventoryTransaction = await InventoryTransactionService.createInventoryTransaction({
            product_id,
            transaction_type: 'out',
            quantity,
            quantity_type: product.quantity_type,
            description: `${product.name}`,
            description_type,
            isDamaged: true,
            audio_path, // Attach audio file path or base64 string
            isManufactured: product.isManufactured,
        }, { transaction: t });

        await ProductService.reduceProductByQuantity(product_id, newStock, { transaction: t });

        // Prepare response
        const result = {
            product_id,
            product_name: product.name,
            previous_stock: product.stock,
            damaged_quantity: quantity,
            new_stock: newStock,
            transaction_id: inventoryTransaction.id,
        };
      
        // Commit the transaction
        await t.commit();

        SuccessResponse.message = "Damaged Product registered successfully.";
        SuccessResponse.data = result;
        return res.status(StatusCodes.OK).json(SuccessResponse);
        
    } catch(error){
        await t.rollback();
        console.error('Error in reportDamagedProducts:', error);
        ErrorResponse.message = "Failed to register damanged product.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

async function createManufacturedProduct(req, res) {
    const transaction = await sequelize.transaction(); // Start a transaction
    try {
        const { name, description, quantity_type, products } = req.body;

        const stock = Number(req.body.stock);
        const product_cost = Number(req.body.product_cost);
        
        let product_image = req.file ? `/uploads/images/${req.file.filename}`: null;

        // Validate existing products and their stock
        for (const item of products) {
            const { product_id, quantity } = item;

            if (!product_id || !quantity || quantity <= 0) {
                throw new AppError(
                    [`Invalid input for product_id: ${product_id} or quantity: ${quantity}.`],
                    StatusCodes.BAD_REQUEST
                );
            }

            const product = await ProductService.getProduct(product_id);

            if (!product) {
                throw new AppError([`Product with id ${product_id} not found.`], StatusCodes.NOT_FOUND);
            }

            if (product.stock < quantity) {
                throw new AppError(
                    [`Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${quantity}.`],
                    StatusCodes.BAD_REQUEST
                );
            }
        }
        
        let manufacturedProduct = await ProductService.getProductByName(name);

        if (manufacturedProduct) {
            // Update existing product's stock
            const newStock = manufacturedProduct.stock + stock;
            const mfcId = manufacturedProduct.id;
         
            manufacturedProduct = await ProductService.updateProduct(
                mfcId,
                newStock,
                { transaction }
            );

            // Create inventory transaction for the updated product
            const invent = await InventoryTransactionService.createInventoryTransaction(
                {
                    product_id: mfcId,
                    transaction_type: 'in',
                    quantity: stock,
                    quantity_type: quantity_type,
                    description: `${name}`,
                    description_type: 'text',
                    isManufactured: true,
                    
                },
                { transaction }
            );
            console.log("inventortyyyyy0", invent);
            
        } else {
            // Create a new manufactured product
            manufacturedProduct = await ProductService.createProduct(
                {
                    name,
                    description,
                    quantity_type,
                    stock,
                    product_cost,
                    product_image,
                    isManufactured: true,
                },
                { transaction }
            );
            

            // Create inventory transaction for the new product
            await InventoryTransactionService.createInventoryTransaction(
                {
                    product_id: manufacturedProduct.id,
                    transaction_type: 'in',
                    quantity: stock,
                    quantity_type,
                    description: `${name}`,
                    description_type: 'text',
                    isManufactured: true
                },
                { transaction }
            );
        }

        // Deduct stock from existing products
        for (const item of products) {
            const { product_id, quantity } = item;

            const product = await ProductService.getProduct(product_id);
            const newStock = product.stock - quantity;

            await ProductService.updateProduct(
                product_id,
                newStock,
                { transaction }
            );

            await InventoryTransactionService.createInventoryTransaction(
                {
                    product_id:product.id,
                    transaction_type: 'out',
                    quantity,
                    quantity_type: product.quantity_type,
                    description: `${product.name}`,
                    description_type: 'text',
                },
                { transaction }
            );
        }

        await transaction.commit(); // Commit the transaction

        SuccessResponse.message = "Manufactured product processed successfully.";
        SuccessResponse.data = { manufacturedProduct };
        return res.status(StatusCodes.CREATED).json(SuccessResponse);
    } catch (error) {
        await transaction.rollback(); // Rollback the transaction
        console.error('Error in createManufacturedProduct:', error);
        ErrorResponse.message = "Failed to process manufactured product.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

async function updateImage(req, res) {
    const transaction = await sequelize.transaction();
    try {
        const { product_id } = req.body;
        let product_image = req.file ? `/uploads/images/${req.file.filename}`: null;
        if(!product_image) {
            await transaction.rollback();
            ErrorResponse.message = "Image file is required.";
            return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }
        const product = await ProductService.getProduct(product_id, {transaction});
        if(!product) {
            ErrorResponse.message = "Product does not exists.";
            await transaction.rollback();
            return res.status(StatusCodes.NOT_FOUND).json(ErrorResponse);
        }
        const updatedProduct = await ProductService.updateImage(product_id, product_image, {transaction});

        await transaction.commit();
        SuccessResponse.message = "Product Image updated Successfully.";
        SuccessResponse.data = updatedProduct;
        return res.status(StatusCodes.ACCEPTED).json(SuccessResponse);
    } catch (error) {
        await transaction.rollback(); // Rollback the transaction
        console.error('Error in updating image:', error);
        ErrorResponse.message = "Failed to update product image.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

async function productSettings(req, res) {
    const transaction = await sequelize.transaction();
    try {
        const { name, description, quantity_type, product_cost, tax, isManufactured, hsn_code   } = req.body;
        
        const { id } = req.params; // Extract `id` from route parameter
        
        const check = await ProductService.getProduct(id, {transaction});
        if(!check) {
            await transaction.rollback();
            throw new AppError(["Product not found."], StatusCodes.NOT_FOUND)
        }
        // Build the update object dynamically
        const updateData = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (quantity_type) updateData.quantity_type = quantity_type;
        if (product_cost) updateData.product_cost = product_cost;
        if (isManufactured) updateData.isManufactured = isManufactured;
        if(hsn_code) updateData.hsn_code = hsn_code;
        if (tax){
            const parsedtax = parseFloat(tax);
            updateData.igst_rate = parsedtax;
            updateData.cgst_rate = parsedtax/2;
            updateData.sgst_rate = parsedtax/2;
        } 

        if (Object.keys(updateData).length == 0) {
            await transaction.rollback();
            throw new AppError(["At least one field is required to update the product."], StatusCodes.CONFLICT);
        }

        const product = await ProductService.updProduct(id, updateData, {transaction});
        await transaction.commit();
        SuccessResponse.message = "Product updated successfully.";
        SuccessResponse.data = product;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        await transaction.rollback();
        console.log(error);
        ErrorResponse.message = "Something went wrong while setting product.";
        ErrorResponse.error = error;
        return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json(ErrorResponse)
    }
}



module.exports = {
    addProduct,
    getProducts,
    getProduct,
    reduceProduct,
    updateProductByQuantity,
    getProductCount,
    validateAndUpdateProducts,
    damagedProducts,
    createManufacturedProduct,
    updateImage,
    productSettings
}


