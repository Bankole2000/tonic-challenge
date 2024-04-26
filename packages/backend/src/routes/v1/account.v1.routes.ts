import { Router } from 'express';
import { preventDuplicateTxn } from '../../middleware/v1/cache.v1.middleware';
import { defaultHandler } from '../../controllers/default.controllers';
import { checkSufficientBalance, checkUserOwnsAccount } from '../../middleware/v1/account.v1.middleware';
import {
  accountDepositHandler,
  accountWithdrawalHandler,
  findUserAccountHandler,
  getAccountDetailsHandler,
  getAccountTransactionsHandler,
  transferHandler
} from '../../controllers/v1/account.controllers';
import { validate } from '../../middleware/v1/zodValidate.v1.middleware';
import {
  accountDepositSchema, accountWidthrawSchema, createAccountSchema, transferSchema
} from '../../utils/validators/account.schema';

const accountRoutes = Router({ mergeParams: true });

accountRoutes.get('/find', validate(createAccountSchema, 'Search Account'), findUserAccountHandler);
accountRoutes.get('/:accountId', checkUserOwnsAccount, getAccountDetailsHandler); // Get account details
accountRoutes.get('/:accountId/transactions', checkUserOwnsAccount, getAccountTransactionsHandler); // Get account transactions
accountRoutes.post('/:accountId/deposit', validate(accountDepositSchema, 'Deposit Transaction'), checkUserOwnsAccount, preventDuplicateTxn, accountDepositHandler); // Deposit into account
accountRoutes.post('/:accountId/withdraw', validate(accountWidthrawSchema, 'Withdrawal Transaction'), checkSufficientBalance, preventDuplicateTxn, accountWithdrawalHandler); // Withdraw from account
accountRoutes.post('/:accountId/transactions', checkUserOwnsAccount, defaultHandler); // Transact (e.g. purchase airtime, etc);
accountRoutes.post('/:accountId/transfer', validate(transferSchema, 'Transfer Transaction'), checkSufficientBalance, preventDuplicateTxn, transferHandler); // Transfer to another account

export default accountRoutes;
