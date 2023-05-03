import { Request, Response } from "express";
import { isValidDate } from "../../utils/helpers/validators";
import { ServiceResponse } from "../../@types/ServiseReponse.type";
import AccountDBService from "../../services/v1/account.service";
import { getIO } from "../../lib/socketIO";
import { socketEventTypes } from "../../utils/validators/socketEvents.schema";
import CacheService from "../../services/v1/cache.service";
import { serverErrorMessage } from "../../utils/helpers/utilityFxns";

const accountService = new AccountDBService();

export const getAccountDetailsHandler = async (req: Request, res: Response) => {
  const { accountId } = req.params;
  const { code, data, error } = await accountService.getAccountDetails(accountId);
  if (!data) {
    const sr = new ServiceResponse(
      `Error getting Account details`,
      null,
      false,
      code,
      code === 404 ? 'Account not found' : 'Error getting account details',
      error,
      `Ensure that this account exists`,
      res.locals.newAccessToken
    )
    res.status(sr.statusCode).send(sr);
  }
  const sr = new ServiceResponse(
    `Account details`,
    data,
    true,
    code,
    null,
    null,
    null,
    res.locals.newAccessToken
  )
  res.status(sr.statusCode).send(sr);
}

export const findUserAccountHandler = async (req: Request, res: Response) => {
  const { bankId, accountNumber } = req.body
  const { data: foundAccount, error, code } = await accountService.findBankAccount(bankId, accountNumber);
  if (!foundAccount) {
    const sr = code > 499
      ? serverErrorMessage(error, code)
      : new ServiceResponse(
        `Account not found`,
        foundAccount,
        false,
        code,
        'ACCOUNT_NOT_FOUND',
        error,
        'Check account details and try again',
        res.locals.newAccessToken
      )
    return res.status(sr.statusCode).send(sr);
  }
  const sr = new ServiceResponse(
    `Account found`,
    foundAccount,
    true,
    200,
    null,
    null,
    null,
    res.locals.newAccessToken
  )
  res.status(sr.statusCode).send(sr);
}

export const getAccountTransactionsHandler = async (req: Request, res: Response) => {
  const { accountId } = req.params;
  let limit: number;
  let page: number;
  if (parseInt(req.query.limit as string, 10)) {
    limit = parseInt(req.query.limit as string, 10);
  } else {
    limit = 25;
  }
  if (parseInt(req.query.page as string, 10)) {
    page = parseInt(req.query.page as string, 10);
  } else {
    page = 1;
  }
  const { from, to } = req.query;
  let fromDate;
  if (!from || !isValidDate(from as string)) {
    fromDate = null;
  } else {
    fromDate = new Date(from as string).toISOString();
  }
  let toDate;
  if (!to || !isValidDate(to as string)) {
    toDate = new Date().toISOString();
  } else {
    toDate = new Date(to as string).toISOString();
  }
  if (fromDate) {
    const { code, data, error } = await accountService.searchAccountTransactions(accountId, fromDate, toDate, page, limit);
    const sr = new ServiceResponse(
      `Transaction Search Results`,
      data,
      !error,
      code,
      error ? 'Error getting transaction search results' : null,
      error,
      error ? 'Check logs and database' : null,
      res.locals.newAccessToken
    )
    return res.status(sr.statusCode).send(sr);
  }
  const { code, data, error } = await accountService.getAccountTransactions(accountId, page, limit);
  const sr = new ServiceResponse(
    `Transaction Results`,
    data,
    !error,
    code,
    error ? 'Error getting transaction search results' : null,
    error,
    error ? 'Check logs and database' : null,
    res.locals.newAccessToken
  )
  return res.status(sr.statusCode).send(sr);
}

export const accountDepositHandler = async (req: Request, res: Response) => {
  const { accountId } = req.params;
  const { amount, description } = req.body;
  const cacheService = new CacheService();
  await cacheService.cacheTransferTxn(accountId, null, amount);
  const { data, error, code } = await accountService.creditAccount(accountId, amount, description)
  if (error) {
    const sr = new ServiceResponse(
      `Error processing deposit transaction`,
      null,
      false,
      code,
      'Error processing transaction',
      error,
      'Check logs and database',
      res.locals.newAccessToken
    );
    return res.status(sr.statusCode).send(sr);
  }
  const sr = new ServiceResponse(
    `Deposit Transaction successful`,
    data,
    true,
    code,
    null,
    null,
    null,
    res.locals.newAccessToken
  );
  return res.status(sr.statusCode).send(sr);
}

export const accountWithdrawalHandler = async (req: Request, res: Response) => {
  const { accountId } = req.params;
  const { amount, description } = req.body;
  const cacheService = new CacheService();
  await cacheService.cacheTransferTxn(accountId, null, amount);
  const { data, error, code } = await accountService.debitAccount(accountId, amount, description)
  if (error) {
    const sr = new ServiceResponse(
      `Error processing debit transaction`,
      null,
      false,
      code,
      'Error processing transaction',
      error,
      'Check logs and database',
      res.locals.newAccessToken
    );
    return res.status(sr.statusCode).send(sr);
  }
  const sr = new ServiceResponse(
    `Withdrawal Transaction successful`,
    data,
    true,
    code,
    null,
    null,
    null,
    res.locals.newAccessToken
  );
  return res.status(sr.statusCode).send(sr);
}

export const transferHandler = async (req: Request, res: Response) => {
  const { accountId: originAccountId } = req.params;
  const { amount, description, destinationAccountId } = req.body;
  if (originAccountId === destinationAccountId) {
    const sr = new ServiceResponse(
      `Cannot transfer to the same account`,
      null,
      false,
      422,
      'Origin and Destination accounts are the same',
      'INVALID_TRANSFER_ORIGIN_DESTINATION_SAME',
      'You can only transfer from an account to a different account',
      res.locals.newAccessToken
    );
    return res.status(sr.statusCode).send(sr);
  }
  const { data: destinationAccount, code, error: destinationAccountError } = await accountService.getAccountDetails(destinationAccountId);
  if (!destinationAccount) {
    console.log({ destinationAccountError });
    const sr = new ServiceResponse(
      `Receiving account does not exist`,
      destinationAccount,
      false,
      code,
      'Destination account not found',
      destinationAccountError,
      'Please confirm account details and try again',
      res.locals.newAccessToken
    );
    return res.status(sr.statusCode).send(sr);
  }
  const cacheService = new CacheService();
  await cacheService.cacheTransferTxn(originAccountId, destinationAccountId, amount);

  const { data: newTransfer, code: initiateTransferStatusCode, error: initiateTransferError } = await accountService.initiateTransfer(originAccountId, destinationAccountId, amount, description);
  if (!newTransfer) {
    const sr = new ServiceResponse(
      `Error initiating transfer`,
      newTransfer,
      false,
      initiateTransferStatusCode,
      'Error initiatint transfer',
      initiateTransferError,
      'Please confirm account details and amount, and try again',
      res.locals.newAccessToken
    )
    return res.status(sr.statusCode).send(sr);
  }

  // Debit Benefactor
  const { data: senderDebitTxn, error: debitError, code: debitStatusCode } = await accountService.debitAccount(originAccountId, amount, description, "DEBIT", newTransfer.id);

  if (!senderDebitTxn) {
    await accountService.updateTransferStatus(newTransfer.id, 'FAILED');
    const sr = new ServiceResponse(
      `Transaction Failed`,
      debitStatusCode,
      false,
      debitStatusCode,
      'Error debiting sender account',
      debitError,
      'Please check transfer inputs',
      res.locals.newAccessToken
    )
    return res.status(sr.statusCode).send(sr);
  }

  // Credit Beneficiary
  const { data: recieverCreditTxn, error: creditError, code: creditStatusCode } = await accountService.creditAccount(destinationAccountId, amount, description, 'CREDIT', newTransfer.id);
  if (!recieverCreditTxn) {
    // Reverse Transaction if credit failed
    await accountService.creditAccount(originAccountId, amount, `REVERSAL${description ? ' - ' : ''}${description}`, 'CREDIT', newTransfer.id)
    await accountService.updateTransferStatus(newTransfer.id, 'REVERSED');
    const sr = new ServiceResponse(
      `Transaction Failed`,
      null,
      false,
      creditStatusCode,
      'Error crediting sender account',
      creditError,
      'Please check transfer inputs',
      res.locals.newAccessToken
    )
    return res.status(sr.statusCode).send(sr);
  }

  // Update Transaction status to successful
  const { data: completedTransfer, code: transferStatusCode, error: transferError } = await accountService.updateTransferStatus(newTransfer.id, 'SUCCESSFUL');
  if (completedTransfer) {
    // Update Clients in realtime
    getIO().to(completedTransfer.originAccount.user.id).emit(socketEventTypes.ACCOUNT_DEBITED, senderDebitTxn);
    getIO().to(completedTransfer.destinationAccount.user.id).emit(socketEventTypes.ACCOUNT_CREDITED, recieverCreditTxn)
  }

  const sr = new ServiceResponse(
    `Transfer Completed`,
    completedTransfer,
    !transferError,
    transferStatusCode,
    transferError ? 'An error occured during the transfer' : null,
    transferError,
    transferError ? 'Check logs and database' : null,
    res.locals.newAccessToken
  )
  return res.status(sr.statusCode).send(sr);
}