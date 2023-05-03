import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import apiRouter from './routes/index.routes';
import { fizzBuzzHandler, healthCheckHandler, routeNotFoundHandler } from './controllers/default.controllers';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use('/api', apiRouter);
app.get('/health-check', healthCheckHandler);
app.get('/fizz-buzz', fizzBuzzHandler);
app.use('*', routeNotFoundHandler);

export { app };
