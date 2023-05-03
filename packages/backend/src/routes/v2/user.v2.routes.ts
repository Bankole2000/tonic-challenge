import { defaultHandler } from '../../controllers/default.controllers';
import { Router } from 'express';

const userRoutes = Router();

userRoutes.post('/login', defaultHandler);
userRoutes.post('/register', defaultHandler);

export default userRoutes