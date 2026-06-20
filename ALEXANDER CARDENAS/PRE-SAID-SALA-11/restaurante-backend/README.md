# Restaurante Backend (PRE-SAID · Sala 11)

API REST con **NestJS** para gestionar el menú de platos del restaurante. Incluye persistencia local con **SQLite** (sin servidor de base de datos externo).

## Estado del proyecto (Día 1)

| Componente | Estado |
|------------|--------|
| Módulo **Platos** (CRUD completo) | Listo |
| TypeORM + SQLite (`db.sqlite`) | Configurado |
| Validación de DTOs (`class-validator`) | Activo en `/platos` |
| Tests automatizados | Pendiente |

## Requisitos previos

- **Node.js** 20 LTS o superior ([nodejs.org](https://nodejs.org)). Comprobar:
  ```bash
  node -v
  npm -v
  ```
- Si `npm` no se reconoce en Windows: añadir `C:\Program Files\nodejs` al **PATH** y reiniciar la terminal.
- En Windows, `better-sqlite3` puede pedir herramientas de compilación. Si falla al instalar, instala [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) con la carga **“Desarrollo de escritorio con C++”**.

## Puesta en marcha (para todo el equipo)

```bash
# 1. Clonar el repo y entrar a esta carpeta
cd restaurante-backend

# 2. Instalar dependencias
npm install

# 3. Arrancar en modo desarrollo
npm run start:dev
```

La API queda en **http://localhost:3000** (puerto por defecto; configurable con variable de entorno `PORT`).

### Documentación Swagger

Con el servidor en marcha, abre en el navegador:

**http://localhost:3000/api**

Ahí puedes ver y probar los endpoints de **platos**, **mesas** y **pedidos**.

Dependencia: `@nestjs/swagger` (incluida en `package.json`; se instala con `npm install`).

Al primer arranque se crea automáticamente **`db.sqlite`** en la raíz de `restaurante-backend`. Cada desarrollador tiene su propia base local; **no subas `db.sqlite` al repositorio** (datos de prueba personales).

### Problema frecuente: error de certificados SSL al instalar

En redes con proxy, antivirus o VPN puede aparecer:

```text
npm error code UNABLE_TO_VERIFY_LEAF_SIGNATURE
```

Instalación temporal (solo si lo anterior falla):

```bash
npm install --strict-ssl=false
```

O para un solo comando:

```bash
npm install @nestjs/typeorm typeorm better-sqlite3 class-validator class-transformer --strict-ssl=false
```

En casa o con otro Wi‑Fi suele bastar `npm install` normal.

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Desarrollo con recarga automática |
| `npm run start` | Arranque sin watch |
| `npm run build` | Compila a `dist/` |
| `npm run start:prod` | Ejecuta build de producción |
| `npm run lint` | ESLint |
| `npm run test` | Tests unitarios (cuando existan) |

## Estructura del código

```text
src/
├── app.module.ts          # TypeORM (SQLite) + módulos
├── main.ts
└── platos/
    ├── platos.module.ts
    ├── platos.controller.ts
    ├── platos.service.ts
    ├── dto/
    │   ├── crear-plato.dto.ts
    │   └── actualizar-plato.dto.ts
    └── entities/
        └── plato.entity.ts
```

## Base de datos

- **Motor:** SQLite vía driver `better-sqlite3`
- **Archivo:** `db.sqlite` (raíz del proyecto)
- **Tabla:** `platos`
- **Sincronización:** `synchronize: true` en desarrollo (TypeORM crea/actualiza el esquema al iniciar)

### Entidad `Plato`

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | number | Autogenerado |
| `nombre` | string | Máx. 100 caracteres |
| `precio` | number | Decimal, debe ser positivo |
| `disponible` | boolean | Por defecto `true` |
| `createdAt` | Date | Automático |
| `updatedAt` | Date | Automático |

## API REST — Platos

Base: `http://localhost:3000`

| Método | Ruta | Descripción | Body |
|--------|------|-------------|------|
| `POST` | `/platos` | Crear plato | JSON obligatorio |
| `GET` | `/platos` | Listar todos | — |
| `GET` | `/platos/:id` | Obtener por id | — |
| `PATCH` | `/platos/:id` | Actualizar (parcial) | JSON parcial |
| `DELETE` | `/platos/:id` | Eliminar | — → **204** sin cuerpo |

### Crear plato — `POST /platos`

Headers: `Content-Type: application/json`

```json
{
  "nombre": "Pizza margarita",
  "precio": 12.5,
  "disponible": true
}
```

`disponible` es opcional (default `true`).

### Actualizar plato — `PATCH /platos/:id`

Solo envía los campos a cambiar:

```json
{
  "precio": 14.99,
  "disponible": false
}
```

### Respuestas de error habituales

| Código | Motivo |
|--------|--------|
| `400` | Body inválido o validación fallida (precio ≤ 0, nombre vacío, campos no permitidos) |
| `404` | No existe un plato con ese `id` |

## Cómo probar los endpoints

1. Asegúrate de que `npm run start:dev` esté en ejecución sin errores.
2. Usa **Postman**, **Thunder Client** (extensión de VS Code/Cursor) o **PowerShell**:

```powershell
# Crear
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/platos" `
  -ContentType "application/json" `
  -Body '{"nombre":"Ensalada César","precio":8.5,"disponible":true}'

# Listar
Invoke-RestMethod -Uri "http://localhost:3000/platos"

# Ver uno
Invoke-RestMethod -Uri "http://localhost:3000/platos/1"

# Actualizar
Invoke-RestMethod -Method Patch -Uri "http://localhost:3000/platos/1" `
  -ContentType "application/json" `
  -Body '{"precio":9.99}'

# Eliminar
Invoke-RestMethod -Method Delete -Uri "http://localhost:3000/platos/1"
```

3. En el navegador solo funcionan los **GET** (`/platos`, `/platos/1`).

Orden recomendado de prueba: **POST → GET all → GET :id → PATCH → DELETE**.

## Dependencias principales

| Paquete | Uso |
|---------|-----|
| `@nestjs/typeorm` + `typeorm` | ORM |
| `better-sqlite3` | Driver SQLite |
| `class-validator` + `class-transformer` | Validación de DTOs |
| `@nestjs/swagger` | Documentación OpenAPI en `/api` |

Todas están en `package.json`; con `npm install` el equipo no necesita instalarlas una a una.

## Tecnologías

- [NestJS](https://nestjs.com/) 11
- [TypeORM](https://typeorm.io/) 1.x
- SQLite (`better-sqlite3`)
- TypeScript

## Próximos pasos (equipo)

- Módulos adicionales del dominio (pedidos, mesas, etc.)
- Variables de entorno (`.env`) si se requiere configuración por entorno
- Tests e2e / unitarios
- Desactivar `synchronize` en producción y usar migraciones

## Licencia

Proyecto académico / equipo PRE-SAID — ver repositorio del curso para condiciones de uso.
