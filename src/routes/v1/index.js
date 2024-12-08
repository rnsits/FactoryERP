const express = require('express');
const router = express.Router();
const BalanTranRouter = require('./balance_transaction.route');
const ExpenseRoutes = require('./expenses.route');
const ProductRouter = require('./product.route');
const CustomerRoutes = require('./customers.route');
const CustomerPaymentRoutes = require('./customer_payment.route');
const PurchaseRouter = require('./purchase.route');
const InvoiceRouter = require('./invoice.route');
const UserRouter = require('./user.route');
const VendorRouter = require('./vendors.route');
const AuthRouter = require('./auth.routes');
const InvTransRoutes = require('./inventory_transaction.route');


router.use('/auth', AuthRouter);
router.use('/customers', CustomerRoutes);
router.use('/customer_payments', CustomerPaymentRoutes);
router.use('/expenses', ExpenseRoutes);
router.use('/inventory', InvTransRoutes);
router.use('/invoices', InvoiceRouter);
router.use('/products', ProductRouter);
router.use('/purchases', PurchaseRouter);
router.use('/users', UserRouter);
router.use('/vendors', VendorRouter);
router.use('/balantran', BalanTranRouter);

module.exports = router;