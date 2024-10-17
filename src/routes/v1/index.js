const express = require('express');
const router = express.Router();
const ExpenseRoutes = require('./expenses.route');
const InventoryRoutes = require('./inventory.route');
const ProductRouter = require('./product.route');
const CategoryRouter = require('./category.route');
const CustomerRoutes = require('./customers.route');
const CustomerPaymentRoutes = require('./customer_payment.route');
const PurchaseRouter = require('./purchase.route');
const InvoiceRouter = require('./invoice.route');
const Invoice_ItemRouter = require('./invoice_item.route');
const UserRouter = require('./user.route');
const VendorRouter = require('./vendors.route');
const AuthRouter = require('./auth.routes');


router.use('/auth', AuthRouter);
router.use('/category', CategoryRouter);
router.use('/customers', CustomerRoutes);
router.use('/customer_payments', CustomerPaymentRoutes);
router.use('/expenses', ExpenseRoutes);
router.use('/invoices', InvoiceRouter);
router.use('/invoiceitems', Invoice_ItemRouter);
router.use('/inventory', InventoryRoutes);
router.use('/products', ProductRouter);
router.use('/purchases', PurchaseRouter);
router.use('/users', UserRouter);
router.use('/vendors', VendorRouter);

module.exports = router;