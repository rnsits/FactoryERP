const express = require("express");
const { ExpensesController } = require("../../controllers");
const { ExpensesMiddleware } = require("../../middlewares");
const authenticate = require('../../middlewares/auth.middleware');
const ExpenseRoutes = express.Router();

/**
 * /api/v1/auth/expenses   POST
 */
ExpenseRoutes.post('/', ExpensesMiddleware.validateBodyRequest, ExpensesController.addExpense);
ExpenseRoutes.post('/expDat', ExpensesController.getExpensesByDate);

/**
 * /api/v1/auth/expenses/:expenseId   GET
 */
ExpenseRoutes.get('/today', ExpensesController.getTodayExpenses);
ExpenseRoutes.get('/:expenseId', ExpensesMiddleware.validateGetRequest, ExpensesController.getExpense);

/**
 * /api/v1/auth/expenses/  GET
 */
ExpenseRoutes.get('/', ExpensesController.getAllExpenses);

module.exports = ExpenseRoutes;