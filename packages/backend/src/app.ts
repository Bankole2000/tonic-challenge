import express from 'express';
import cors from 'cors';
// eslint-disable-next-line import/no-extraneous-dependencies
import { uuid } from 'uuidv4';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import apiRouter from './routes/index.routes';
import {
  fizzBuzzHandler, healthCheckHandler, routeNotFoundHandler, welcomeRouteHandler
} from './controllers/default.controllers';

const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  message:
    'Too many requests from this IP, please try again after 1 minute',
});

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use('/api', apiRateLimit, apiRouter);
app.get('/health-check', healthCheckHandler);
app.get('/fizz-buzz', fizzBuzzHandler);
app.get('/', welcomeRouteHandler);
app.get('/uuid', async (req, res) => {
  const id = uuid();
  return res.send({ id });
});
app.use('*', routeNotFoundHandler);

export { app };
