import { defaultHandler } from '../../controllers/default.controllers';
import { Router } from 'express';

const authRoutes = Router();

authRoutes.post('/login', defaultHandler);
authRoutes.post('/register', defaultHandler);

export default authRoutes