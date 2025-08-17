import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

async function bootstrap() {
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

  // LA SEULE MODIFICATION NÉCESSAIRE EST ICI
  app.enableCors({
    origin: 'https://arsai-frontend.onrender.com', // Remplacez par l'URL de votre frontend
  });

  app.setGlobalPrefix('api');

  const httpServer = createServer(expressApp);

  const io = new Server(httpServer, {
    cors: {
      origin: 'https://arsai-frontend.onrender.com', // Et ici aussi pour les WebSockets
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Socket.io client connected:', socket.id);
    socket.emit('hello', { message: 'Socket.io is working!' });
    socket.on('disconnect', () => {
      console.log('Socket.io client disconnected:', socket.id);
    });
  });

  const port = process.env.PORT || 8000;
  await app.init();
  httpServer.listen(port, () => {
    console.log(`Server (with socket.io) running on port ${port}`);
  });
}
bootstrap();