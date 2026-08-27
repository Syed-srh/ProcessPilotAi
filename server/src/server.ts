import http from 'http';
import app from './app';
import { env } from './config/env';
import { initSocketIO } from './config/socket';

const server = http.createServer(app);
initSocketIO(server);

server.listen(env.PORT, () => {
  console.log(`🚀 ProcessPilot AI Server running on port ${env.PORT} [${env.NODE_ENV}]`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
