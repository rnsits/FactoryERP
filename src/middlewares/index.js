module.exports = {
    AuthMiddleware: require('../middlewares/auth.middleware'),
    CustomerMiddleware: require('../middlewares/customers.middleware'),
    CategoryMiddleware: require('../middlewares/category.middleware'),
    ProductMiddleware: require('../middlewares/product.middleware'),
    UserMiddleware: require('../middlewares/user.middleware'),
    VendorMiddleware: require('../middlewares/vendors.middleware'),
    InvoiceItemMiddleware: require('../middlewares/invoice_item.middleware'),
    ExpensesMiddleware: require('../middlewares/expenses.middleware'),
    PurchasesMiddleware: require('../middlewares/purchases.middleware'),
    InventoryMiddleware: require('../middlewares/inventory.middleware'),
    InvoiceMiddleware: require('../middlewares/invoice.middleware'),
}