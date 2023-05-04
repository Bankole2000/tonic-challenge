import { Router } from 'express';
import { adminGetUsersHandler } from '../../controllers/v1/admin.controllers';
import {
  adminAddUserHandler,
  adminAddUserRoleHandler,
  adminDeleteUserHandler,
  adminGetUserAccountsHandler,
  adminGetUserTransactionsHandler,
  adminRemoveUserRoleHandler,
  adminUpdateUserHandler
} from '../../controllers/v1/admin/users.controllers';
import {
  adminCreateAccountForUserHandler,
  adminDeleteUserAccountHandler,
  adminDepositIntoAccountHandler,
  adminFindAccountHandler,
  adminGetAccountsHandler,
  adminGetAccountTransactionsHandler,
  adminGetTransactionsHandler,
  adminReverseTransaction,
  adminReverseTransferHandler,
  adminTransferBetweenAccountsHandler,
  adminWithdrawFromAccountHandler
} from '../../controllers/v1/admin/accounts.controllers';
import { checkAccountExists, checkUserExists } from '../../middleware/v1/admin.v1.middleware';
import { validate } from '../../middleware/v1/zodValidate.v1.middleware';
import { registerSchema, roleChangeSchema } from '../../utils/validators/auth.schema';
import { updateProfileSchema } from '../../utils/validators/user.schema';
import { getBanksHandler, getRolesHandler } from '../../controllers/v1/system.controllers';

const adminRoutes = Router();

// Manage Users
adminRoutes.get('/users', adminGetUsersHandler);
adminRoutes.post('/users', validate(registerSchema, 'Add User'), adminAddUserHandler);
adminRoutes.patch('/users/:userId', checkUserExists, validate(updateProfileSchema), adminUpdateUserHandler);
adminRoutes.delete('/users/:userId', checkUserExists, adminDeleteUserHandler);
adminRoutes.get('/users/:userId/accounts', checkUserExists, adminGetUserAccountsHandler);
adminRoutes.get('/users/:userId/transactions', checkUserExists, adminGetUserTransactionsHandler);
adminRoutes.post('/users/:userId/roles', checkUserExists, validate(roleChangeSchema, 'Role'), adminAddUserRoleHandler);
adminRoutes.delete('/users/:userId/roles/:role', checkUserExists, adminRemoveUserRoleHandler);

// Manage Settings
adminRoutes.get('/settings/banks', getBanksHandler);
adminRoutes.get('/settings/roles', getRolesHandler);

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

export default adminRoutes;
