import { object, string } from 'zod';
import { isNotEmpty, isNumbersOnly } from '../helpers/validators';

export const updateProfileFields = ['firstname', 'lastname', 'bvn'];

export const updateProfileSchema = object({
  body: object({
    firstname: string({
      invalid_type_error: 'Firstname must be a string'
    }).min(1, 'Firstname must be at least 1 character long')
      .refine((data) => isNotEmpty(data), 'Firstname cannot be empty')
      .optional(),
    lastname: string({
      invalid_type_error: 'Lastname must be a string'
    }).min(1, 'Lastname must be at least 1 character long')
      .refine((data) => isNotEmpty(data), 'Lastname cannot be empty')
      .optional(),
    bvn: string({
      invalid_type_error: 'BVN must be a string'
    }).min(11, 'BVN must be 11 characters long')
      .max(11, 'BVN must be 11 characters long')
      .refine((data) => isNumbersOnly(data), 'BVN must be numbers')
      .optional()
  }).refine((data) => !!Object.keys(data).length, '')
});
