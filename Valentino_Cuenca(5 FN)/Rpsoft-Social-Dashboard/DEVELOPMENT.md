# 📖 Guía de Desarrollo

## Requisitos previos

- Node.js 18+
- npm 9+
- Git

## Setup inicial

1. **Clonar el repositorio**
   ```bash
   git clone <repo-url>
   cd rpsoft-dashboard
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   # Edita .env.local con tus valores
   ```
   
   Variables requeridas:
   - `PORT`: Puerto donde correr la app (default: 3000)
   - `NODE_ENV`: Ambiente (development/production/test)
   - `YOUTUBE_API_KEY`: (Opcional) Tu API key de YouTube
   - `BACKUP_PATH`: Ruta al archivo de respaldo

## Scripts disponibles

```bash
# Desarrollo con watch
npm run start:dev

# Build
npm build

# Producción
npm run start:prod

# Tests
npm run test
npm run test:watch
npm run test:cov

# Linting
npm run lint

# Formateo
npm run format
```

## Estructura del proyecto

```
src/
├── common/                      # Código compartido
│   ├── dto/                    # Data Transfer Objects
│   ├── filters/                # Filtros globales
│   ├── health/                 # Health check endpoints
│   ├── interceptors/           # Interceptores globales
│   └── interfaces/             # Interfaces compartidas
├── config/                      # Configuración
├── entities/                    # Entidades de BD
├── modules/
│   ├── youtube/               # Integración YouTube
│   ├── snapshot/              # Gestión de snapshots
│   ├── analytics/             # Motor de análisis
│   ├── channels/              # Gestión de canales
│   ├── cron/                  # Jobs automáticos
│   └── social/                # Redes sociales
├── app.module.ts              # Módulo raíz
├── app.controller.ts          # Controlador raíz
└── main.ts                    # Punto de entrada
```

## Convenciones de código

### Naming
- Controllers: `*.controller.ts`
- Services: `*.service.ts`
- Modules: `*.module.ts`
- DTOs: `*.dto.ts`
- Entities: `*.entity.ts`
- Tests: `*.spec.ts`

### Estructura de controlador
```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MyService } from './my.service';

@Controller('api/resource')
export class MyController {
  constructor(private readonly myService: MyService) {}

  @Get()
  findAll() {
    return this.myService.findAll();
  }

  @Post()
  create(@Body() createDto: CreateDto) {
    return this.myService.create(createDto);
  }
}
```

## API Endpoints

### Health Check
```
GET /api/health          - Status general
GET /api/health/ready    - Readiness probe
GET /api/health/live     - Liveness probe
```

### YouTube
```
GET  /api/youtube/status         - Estado de la fuente
POST /api/youtube/fetch          - Jalar datos
```

### Canales
```
GET /api/channels/consolidated   - Vista consolidada
GET /api/channels/brands         - Listado de marcas
```

### Analytics
```
GET /api/analytics/dashboard          - Dashboard completo
GET /api/analytics/top-channels       - Ranking de canales
GET /api/analytics/top-videos         - Top videos
GET /api/analytics/content-type       - Shorts vs videos largos
GET /api/analytics/trend/:channelId   - Tendencia específica
```

### Snapshots
```
GET /api/snapshots  - Snapshots por rango de fechas
```

## Validación

Todos los DTOs son validados automáticamente en tiempo de ejecución usando `class-validator`.

Ejemplo:
```typescript
import { IsString, IsNumber, Min, Max } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  subscribers: number;
}
```

## Manejo de errores

El proyecto usa un filtro global de excepciones (`AllExceptionsFilter`) que normaliza todas las respuestas de error:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "BadRequest",
  "timestamp": "2026-06-12T10:30:00.000Z"
}
```

## Respuestas de éxito

Todas las respuestas de éxito son transformadas por `TransformInterceptor`:

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": { /* tu data aquí */ },
  "timestamp": "2026-06-12T10:30:00.000Z"
}
```

## Variables de entorno

Crea un archivo `.env.local` para desarrollo local (no se commitea):

```env
PORT=3000
NODE_ENV=development
YOUTUBE_API_KEY=tu_api_key_aqui
BACKUP_PATH=backup-data/backup.json
```

**⚠️ IMPORTANTE**: Nunca commitees `.env` o `.env.*.local`. Usa `.env.example` como referencia.

## Testing

```bash
# Ejecutar todos los tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

## Debugging

### VS Code
Usa la configuración de debug en `.vscode/launch.json`:

```bash
npm run start:debug
```

### Chrome DevTools
```bash
node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand
```

## Performance

- Los snapshots se guardan automáticamente diariamente a las 12:00 PM
- Los datos se cachean en memoria durante la sesión
- Usa SQL.js para persistencia en BD local

## Troubleshooting

### Error: "YOUTUBE_API_KEY is not configured"
- Verifica que tienes `.env.local` o `.env` con `YOUTUBE_API_KEY` configurada
- O usa el dataset de respaldo automáticamente

### Error: "Validation error"
- Chequea que los datos cumplan con los DTOs definidos
- Revisa los tipos esperados en los DTOs

### La BD no se sincroniza
- Elimina la carpeta `data/` y reinicia
- TypeORM reconstruirá las tablas automáticamente

## Recursos

- [NestJS Docs](https://docs.nestjs.com)
- [TypeORM Docs](https://typeorm.io)
- [Class Validator](https://github.com/typestack/class-validator)
- [YouTube Data API](https://developers.google.com/youtube/v3)
