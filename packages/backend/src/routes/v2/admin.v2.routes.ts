import { Router } from 'express';
import { defaultHandler } from '../../controllers/default.controllers';
import { validate } from '../../middleware/v2/auth.v2.middleware';
import { loginSchema } from '../../utils/validators/auth.schema';

const adminRoutes = Router();

adminRoutes.post('/login', validate(loginSchema, 'Login'), defaultHandler);
adminRoutes.post('/register', defaultHandler);

export default adminRoutes;
