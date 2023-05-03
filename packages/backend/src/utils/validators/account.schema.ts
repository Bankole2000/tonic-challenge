import { number, object, string } from 'zod';
import { isNotEmpty, isNumbersOnly, isValidObjectId } from '../../utils/helpers/validators';

export const createAccountSchema = object({
  body: object({
    accountNumber: string({
      required_error: 'Account number is required',
    })
      .min(10, 'Account number must be 10 digits long')
      .max(10, 'Account number must be 10 digits long')
      .refine(data => isNumbersOnly(data), 'Account number must be numbers only')
    ,
    bankId: string({
      required_error: 'Bank Id is required',
    }).refine(data => isNotEmpty(data), 'Bank Id cannot be empty')
      .refine(data => isValidObjectId(data), 'Invalid Bank Id'),
  })
})

export const accountDepositSchema = object({
  body: object({
    amount: number({
      required_error: 'Deposit amount is required',
    }).min(100, 'Minimum deposit amount is 100kobo (1 Naira)'),
    description: string({
      invalid_type_error: 'Description must be a string'
    }).optional()
  })
});

export const accountWidthrawSchema = object({
  body: object({
    amount: number({
      required_error: 'Widthrawal amount is required',
    }).min(100, 'Minimum withdrawal amount is 100kobo (1 Naira)'),
    description: string({
      invalid_type_error: 'Description must be a string'
    }).optional()
  })
})

export const transferSchema = object({
  body: object({
    destinationAccountId: string({
      required_error: 'Destination Account Id is required',
    }).refine(data => isNotEmpty(data), 'Destination Account Id cannot be empty')
      .refine(data => isValidObjectId(data), 'Invalid Destination Account Id'),
    amount: number({
      required_error: 'Transfer amount is required',
    }).min(100, 'Minimum transfer amount is 100kobo (1 Naira)'),
    description: string({
      invalid_type_error: 'Description must be a string'
    }).optional()
  })
})