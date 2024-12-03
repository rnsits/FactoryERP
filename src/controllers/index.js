module.exports = {
    AuthController: require('../controllers/auth.controller'),
    BalanceTransactionController: require('../controllers/balance_transaction.controller'),
    CategoryController: require('../controllers/category.controller'),
    CustomerController: require('../controllers/customers.controller'),
    CustomerPaymentController: require('./customer_payment.controller'),
    ExpensesController: require('../controllers/expenses.controller'),
    InvoiceController: require('../controllers/invoice.controller'),
    InvTransController: require('../controllers/inventory_transaction.controller'),
    ProductController: require('../controllers/product.controller'),
    PurchaseController: require('../controllers/purchases.controller'),
    UserController: require('../controllers/user.controller'),
    VendorController: require('../controllers/vendors.controller')
}