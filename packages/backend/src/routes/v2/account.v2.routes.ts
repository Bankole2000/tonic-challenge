import { defaultHandler } from '../../controllers/default.controllers';
import { Router } from 'express';

const accountRountes = Router();

accountRountes.post('/login', defaultHandler);
accountRountes.post('/register', defaultHandler);

export default accountRountes