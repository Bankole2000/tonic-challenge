import { Router } from 'express';
import { defaultHandler } from '../../controllers/default.controllers';

const authRoutes = Router();

authRoutes.post('/login', defaultHandler);
authRoutes.post('/register', defaultHandler);

export default authRoutes;
