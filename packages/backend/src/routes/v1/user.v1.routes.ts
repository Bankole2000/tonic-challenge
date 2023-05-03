import { Router } from 'express';
import { validate } from '../../middleware/v1/zodValidate.v1.middleware';
import { createAccountSchema } from '../../utils/validators/account.schema';
import {
  createNewAccountHandler,
  deleteAccountHandler,
  getUserAccountsHandler,
  getUserTransactionsHandler,
  updateProfileHandler
} from '../../controllers/v1/user.controllers';
import { requireAccountStatus } from '../../middleware/v1/auth.v1.middleware';
import { updateProfileSchema } from '../../utils/validators/user.schema';
import { checkUserOwnsAccount } from '../../middleware/v1/account.v1.middleware';

const userRoutes = Router({ mergeParams: true });

userRoutes.get('/accounts', getUserAccountsHandler); // Get user Accounts
userRoutes.patch('/kyc', validate(updateProfileSchema, 'Profile Update'), updateProfileHandler)
userRoutes.post('/accounts', requireAccountStatus(['COMPLETE', 'NEEDS_ACCOUNT']), validate(createAccountSchema, 'Create Account'), createNewAccountHandler); // Add new user account
userRoutes.delete('/accounts/:accountId', checkUserOwnsAccount, deleteAccountHandler); // delete User account
userRoutes.get('/transactions', getUserTransactionsHandler);

export default userRoutes