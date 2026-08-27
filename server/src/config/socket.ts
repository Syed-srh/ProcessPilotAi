import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from './env';

let io: SocketIOServer | null = null;

export function initSocketIO(server: HttpServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: (requestOrigin, callback) => {
        callback(null, true);
      },
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('subscribe:execution', (executionId: string) => {
      socket.join(`execution:${executionId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function broadcastExecutionLog(executionId: string, logData: any) {
  if (io) {
    io.to(`execution:${executionId}`).emit('execution:log', logData);
    io.emit('execution:event', { executionId, logData });
  }
}

export function broadcastApprovalEvent(approvalData: any) {
  if (io) {
    io.emit('approval:event', approvalData);
  }
}

export function broadcastNotification(notificationData: any) {
  if (io) {
    io.emit('notification:event', notificationData);
  }
}
