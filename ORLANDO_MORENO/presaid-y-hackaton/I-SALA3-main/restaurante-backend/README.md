# restaurante-backend

Backend del sistema de restaurante — PRE-SAID Día 1.

## Stack
- **Framework**: NestJS v10
- **ORM**: TypeORM v0.3
- **Base de datos**: SQLite (`db.sqlite`) — desarrollo
- **Validación**: class-validator + class-transformer
- **Puerto**: `3000`

## Módulos
| Módulo | Endpoints | Estado |
|--------|-----------|--------|
| Platos | POST / GET / GET:id / PATCH:id / DELETE:id | ✅ |

## Instalación

```bash
cd restaurante-backend
npm install
```

## Levantar en desarrollo

```bash
npm run start:dev
```

## Levantar en producción (desde dist)

```bash
npm run start:prod
```

## Verificar

```
GET http://localhost:3000/platos
```

Respuesta esperada: `200 OK` con array JSON de platos.

## Estructura del proyecto

```
src/
├── main.ts
├── app.module.ts
└── platos/
    ├── platos.module.ts
    ├── platos.controller.ts
    ├── platos.service.ts
    ├── entities/
    │   └── plato.entity.ts
    └── dto/
        ├── create-plato.dto.ts
        └── update-plato.dto.ts
```

## Entidad Plato

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | number | Auto-generado |
| `nombre` | string | Requerido |
| `precio` | decimal | Requerido, mín 0 |
| `disponible` | boolean | Default `true` |
| `createdAt` | Date | Auto |
| `updatedAt` | Date | Auto |
