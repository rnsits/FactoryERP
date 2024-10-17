const express = require("express");
const { ExpensesController } = require("../../controllers");
const { ExpensesMiddleware } = require("../../middlewares");
const ExpenseRoutes = express.Router();

/**
 * /api/v1/auth/Expense   POST
 */
ExpenseRoutes.post('/', ExpensesMiddleware.validateBodyRequest, ExpensesController.addExpense);

/**
 * /api/v1/auth/Expense/:expenseId   GET
 */
ExpenseRoutes.get('/:expenseId', ExpensesMiddleware.validateGetRequest, ExpensesController.getExpense);

/**
 * /api/v1/auth/Expenses/  GET
 */
ExpenseRoutes.get('/', ExpensesController.getAllExpenses);

module.exports = ExpenseRoutes;