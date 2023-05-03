import logger from 'jet-logger';
import http from 'http';
import { setIO } from './lib/socketIO';
import { app } from './app';
import { config } from './utils/config';
import { seedBankData } from './utils/helpers/initializers';
import { socketEventHandlers, socketEventTypes } from './utils/validators/socketEvents.schema';

const { self } = config;
const PORT = self.port;

const httpServer = http.createServer(app);

const io = setIO(httpServer, '/socket');

io.on('connection', (socket) => {
  logger.info('Socket connected');
  socket.on('disconnect', () => {
    logger.info('Socket disconnected');
  });
  socket.on(socketEventTypes.USER_CONNECTED, async (data, ack) => {
    const result = await socketEventHandlers[socketEventTypes.USER_CONNECTED](data, socket, io);
    ack(result);
  });
});

httpServer.listen(PORT, async () => {
  await seedBankData();
  logger.info(`App running on port ${PORT}`);
});
