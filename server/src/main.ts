import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

async function bootstrap() {
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

  // Configuration CORS pour les requêtes HTTP (Login, Register, etc.)
  // On autorise explicitement votre frontend à communiquer avec ce backend.
  app.enableCors({
    origin: 'https://arsai-frontend.onrender.com',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Définit le préfixe global pour toutes les routes de l'API (ex: /api/auth/login)
  app.setGlobalPrefix('api');

  // Crée un serveur HTTP pour gérer à la fois Express (NestJS) et Socket.IO
  const httpServer = createServer(expressApp);

  // Configuration de Socket.IO avec les bonnes permissions CORS
  const io = new Server(httpServer, {
    cors: {
      origin: 'https://arsai-frontend.onrender.com', // Autorisation pour les WebSockets
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Logique pour les connexions WebSocket
  io.on('connection', (socket) => {
    console.log('Socket.io client connected:', socket.id);
    socket.emit('hello', { message: 'Socket.io is working!' });
    socket.on('disconnect', () => {
      console.log('Socket.io client disconnected:', socket.id);
    });
  });

  // Le port est fourni par l'environnement de Render. 3000 est une valeur par défaut.
  const port = process.env.PORT || 3000;
  
  // Initialise l'application NestJS
  await app.init(); 

  // Démarre le serveur HTTP pour qu'il écoute sur le bon port
  httpServer.listen(port, () => {
    console.log(`Server (with socket.io) running on port ${port}`);
  });
}

// Lance l'application
bootstrap();