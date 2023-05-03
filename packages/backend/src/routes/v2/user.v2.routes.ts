import { Router } from 'express';
import { defaultHandler } from '../../controllers/default.controllers';

const userRoutes = Router();

userRoutes.post('/login', defaultHandler);
userRoutes.post('/register', defaultHandler);

export default userRoutes;
