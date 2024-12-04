module.exports = {
    AuthMiddleware: require('../middlewares/auth.middleware'),
    BalanceTransactionMiddleware: require('../middlewares/balance_transaction.middleware'),
    CustomerMiddleware: require('../middlewares/customers.middleware'),
    ProductMiddleware: require('../middlewares/product.middleware'),
    UserMiddleware: require('../middlewares/user.middleware'),
    VendorMiddleware: require('../middlewares/vendors.middleware'),
    ExpensesMiddleware: require('../middlewares/expenses.middleware'),
    PurchasesMiddleware: require('../middlewares/purchases.middleware'),
    InvoiceMiddleware: require('../middlewares/invoice.middleware'),
    InventoryMiddleware: require('../middlewares/invTrans.middleware')
}