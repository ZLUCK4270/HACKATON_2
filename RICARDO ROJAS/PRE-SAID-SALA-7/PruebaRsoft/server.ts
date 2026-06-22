import * as dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './server/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

async function startServer() {
  console.log("Cargando API KEY de YouTube:", process.env.YOUTUBE_API_KEY ? "¡Clave encontrada!" : "No se encontró la clave en el entorno.");
  
  const server = express();
  server.use(express.json());

  // Attach Vite middleware BEFORE Nest routes are applied, to handle the SPA fallback properly.
  // We exclude /api/ so backend requests bypass Vite and hit NestJS.
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    server.use((req, res, next) => {
      if (req.path.startsWith('/api')) {
        next();
      } else {
        vite.middlewares(req, res, next);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    server.use((req, res, next) => {
      if (req.path.startsWith('/api')) {
        next();
      } else {
        express.static(distPath)(req, res, () => {
          res.sendFile(path.join(distPath, 'index.html'));
        });
      }
    });
  }

  // Inicializamos NestJS DESPUÉS de las configuraciones de Vite/estáticos
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.setGlobalPrefix('api');
  await app.init();

  const PORT = 3000;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();