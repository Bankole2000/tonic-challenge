import { Router } from 'express';
import { defaultHandler } from '../../controllers/default.controllers';

const accountRountes = Router();

accountRountes.post('/login', defaultHandler);
accountRountes.post('/register', defaultHandler);

export default accountRountes;
