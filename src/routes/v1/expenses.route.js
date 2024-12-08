const express = require("express");
const { ExpensesController } = require("../../controllers");
const { ExpensesMiddleware } = require("../../middlewares");
const { authenticateToken } = require('../../middlewares/auth.middleware');
const upload = require("../../config/multer.config");
const { imageUpload, audioUpload, multerMiddleware }= require("../../config/multer.config");
const ExpenseRoutes = express.Router();


/**
 * /api/v1/auth/expenses   POST
 */
// ExpenseRoutes.post('/', authenticateToken, upload.single('audio_path'),ExpensesController.addExpense);
ExpenseRoutes.post('/', authenticateToken, multerMiddleware(audioUpload('audio_path')),
ExpensesMiddleware.validateBodyRequest,  ExpensesController.addExpense);
ExpenseRoutes.post('/expDat', authenticateToken, ExpensesMiddleware.validateDateBody, ExpensesController.getExpensesByDate); 

/**
 * /api/v1/auth/expenses PUT
 */
ExpenseRoutes.put('/markexppaid', authenticateToken, ExpensesMiddleware.validatePaidBody, ExpensesController.markExpensePaid);

/**
 * /api/v1/auth/expenses/:expenseId   GET
 */
ExpenseRoutes.get('/unpaidexp', authenticateToken, ExpensesController.getUnpaidExpenses);
ExpenseRoutes.get('/today', authenticateToken, ExpensesController.getTodayExpenses);
ExpenseRoutes.get('/:expenseId', authenticateToken, ExpensesMiddleware.validateGetRequest, ExpensesController.getExpense);

/**
 * /api/v1/auth/expenses/  GET
 */
ExpenseRoutes.get('/', authenticateToken, ExpensesController.getAllExpenses);

module.exports = ExpenseRoutes;