import { Router } from 'express';
import { validate } from '../../middleware/v1/zodValidate.v1.middleware';
import { loginSchema, registerSchema } from '../../utils/validators/auth.schema';
import {
  loggedInUserHandler, loginHandler, logoutHandler, registerHandler
} from '../../controllers/v1/auth.controllers';
import { requireLoggedInUser } from '../../middleware/v1/auth.v1.middleware';

const authRoutes = Router();

authRoutes.get('/me', requireLoggedInUser, loggedInUserHandler); // Get currently logged in user
authRoutes.post('/login', validate(loginSchema, 'Login'), loginHandler); // Login
authRoutes.post('/register', validate(registerSchema, 'Registeration'), registerHandler); // Signup
authRoutes.get('/logout', requireLoggedInUser, logoutHandler);

export default authRoutes;
