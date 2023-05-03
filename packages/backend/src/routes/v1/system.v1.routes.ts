import { defaultHandler } from '../../controllers/default.controllers';
import { Router } from 'express';
import { getBanksHandler } from '../../controllers/v1/system.controllers';

const systemRoutes = Router();

systemRoutes.get('/banks', getBanksHandler); // Get user Accounts

export default systemRoutes