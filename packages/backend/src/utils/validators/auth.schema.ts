import { boolean, object, string } from 'zod';
import { isNotEmpty } from '../helpers/validators';

export const emailRequiredSchema = object({
  body: object({
    email: string({
      required_error: 'Email is required',
    }).email('Email must be a valid email address'),
  })
});

export const registerFields = ['email', 'password'];

export const registerSchema = object({
  body: object({
    email: string({
      required_error: 'Email is required',
    }).email('Email must be a valid email address'),
    password: string({
      required_error: 'Password is required',
    }).min(8, 'Password must be at least 8 characters')
      .refine((data) => isNotEmpty(data), 'Password cannot be empty'),
    confirmPassword: string({
      required_error: 'Confirm Password is required',
    }),
    tos: boolean({
      required_error: 'You must agree to the terms of service',
    }).refine((data) => data === true, 'You must agree to the terms of service'),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
});

export const loginFields = ['email', 'password'];

export const loginSchema = object({
  body: object({
    email: string({
      required_error: 'Email is required',
    }).email('Email must be a valid email address'),
    password: string({
      required_error: 'Password is required',
    }).min(1, 'Password is required')
      .refine((data) => isNotEmpty(data), 'Password cannot be empty'),
  })
});

export const roleChangeSchema = object({
  body: object({
    role: string({
      required_error: 'You need to specify the role to add / remove'
    })
  })
});
