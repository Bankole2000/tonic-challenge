import { Router } from 'express';
import { getUserIfLoggedIn } from '../middleware/v1/auth.v1.middleware';
import v1Router from './v1/index.v1.routes';
import v2Router from './v2/index.v2.routes';

const apiRouter = Router();

apiRouter.use('/v1', getUserIfLoggedIn, v1Router);
apiRouter.use('/v2', v2Router);

export default apiRouter;
