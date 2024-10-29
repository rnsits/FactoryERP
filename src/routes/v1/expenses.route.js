const express = require("express");
const { ExpensesController } = require("../../controllers");
const { ExpensesMiddleware } = require("../../middlewares");
const { authenticateToken } = require('../../middlewares/auth.middleware');
const ExpenseRoutes = express.Router();

/**
 * /api/v1/auth/expenses   POST
 */
ExpenseRoutes.post('/', authenticateToken, ExpensesMiddleware.validateBodyRequest, ExpensesController.addExpense);
ExpenseRoutes.post('/expDat', authenticateToken, ExpensesController.getExpensesByDate);

/**
 * /api/v1/auth/expenses/:expenseId   GET
 */
ExpenseRoutes.get('/today', authenticateToken, ExpensesController.getTodayExpenses);
ExpenseRoutes.get('/:expenseId', authenticateToken, ExpensesMiddleware.validateGetRequest, ExpensesController.getExpense);

/**
 * /api/v1/auth/expenses/  GET
 */
ExpenseRoutes.get('/', authenticateToken, ExpensesController.getAllExpenses);

module.exports = ExpenseRoutes;