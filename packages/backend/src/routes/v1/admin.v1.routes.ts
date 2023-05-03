import { defaultHandler } from '../../controllers/default.controllers';
import { Router } from 'express';
import { adminGetUsersHandler } from '../../controllers/v1/admin.controllers';
import { adminAddUserHandler, adminDeleteUserHandler, adminGetUserAccountsHandler, adminGetUserTransactionsHandler, adminUpdateUserHandler } from '../../controllers/v1/admin/users.controllers';
import { adminCreateAccountForUserHandler, adminDeleteUserAccountHandler, adminDepositIntoAccountHandler, adminFindAccountHandler, adminGetAccountsHandler, adminGetAccountTransactionsHandler, adminGetTransactionsHandler, adminReverseTransaction, adminReverseTransferHandler, adminTransferBetweenAccountsHandler, adminWithdrawFromAccountHandler } from '../../controllers/v1/admin/accounts.controllers';
import { checkAccountExists, checkUserExists } from '../../middleware/v1/admin.v1.middleware';

const adminRoutes = Router();

// Manage Users
adminRoutes.get('/users', adminGetUsersHandler);
adminRoutes.post('/users', adminAddUserHandler);
adminRoutes.patch('/users/:userId', checkUserExists, adminUpdateUserHandler);
adminRoutes.delete('/users/:userId', checkUserExists, adminDeleteUserHandler);
adminRoutes.get('/users/:userId/accounts', checkUserExists, adminGetUserAccountsHandler);
adminRoutes.get('/users/:userId/transactions', checkUserExists, adminGetUserTransactionsHandler);

// Manage Settings
adminRoutes.get('/settings/banks', defaultHandler);

// Manage Accounts
adminRoutes.get('/accounts', adminGetAccountsHandler);
adminRoutes.get('/accounts/find', adminFindAccountHandler);
adminRoutes.post('/accounts', adminCreateAccountForUserHandler);
adminRoutes.delete('/accounts/:accountId', checkAccountExists, adminDeleteUserAccountHandler);
adminRoutes.post('/accounts/:accountId/deposit', checkAccountExists, adminDepositIntoAccountHandler);
adminRoutes.post('/accounts/:accountId/withdraw', checkAccountExists, adminWithdrawFromAccountHandler);
adminRoutes.get('/accounts/:accountId/transactions', checkAccountExists, adminGetAccountTransactionsHandler);
adminRoutes.post('/accounts/transfer', adminTransferBetweenAccountsHandler);
adminRoutes.delete('/accounts/transfer/:transferId', adminReverseTransferHandler);

// Manage Transactions
adminRoutes.get('/transactions', adminGetTransactionsHandler);
adminRoutes.delete('/transactions/:transactionId', adminReverseTransaction);

export default adminRoutes