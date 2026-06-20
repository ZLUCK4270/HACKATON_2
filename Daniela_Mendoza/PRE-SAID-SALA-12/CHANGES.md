# Cambios del proyecto

## Módulo Pedidos (Día 3)

### Archivos creados

```text
restaurante-backend/src/pedidos/
├── pedido-estado.enum.ts
├── pedido.entity.ts
├── pedidos.module.ts
├── pedidos.service.ts
├── pedidos.controller.ts
└── dto/
    ├── crear-pedido.dto.ts
    ├── actualizar-pedido.dto.ts
    └── cambiar-estado-pedido.dto.ts
```

### Archivo modificado

* `restaurante-backend/src/app.module.ts` — Registro de `PedidosModule` y entidad `Pedido` en TypeORM.

### Relaciones configuradas

| Relación       | Tipo       | Detalle                                 |
| -------------- | ---------- | --------------------------------------- |
| Pedido → Mesa  | ManyToOne  | Un pedido pertenece a una mesa.         |
| Pedido → Plato | ManyToMany | Un pedido puede contener varios platos. |

### Funcionalidades implementadas

1. Creación de pedidos asociados a mesas.
2. Asociación de múltiples platos por pedido.
3. Cálculo automático del total.
4. Actualización de mesa y platos.
5. Cambio de estado mediante endpoint dedicado.
6. Validación de existencia de mesas y platos.
7. Carga automática de relaciones en consultas.

### Endpoints

| Método | Ruta                  |
| ------ | --------------------- |
| POST   | `/pedidos`            |
| GET    | `/pedidos`            |
| GET    | `/pedidos/:id`        |
| PATCH  | `/pedidos/:id`        |
| PATCH  | `/pedidos/:id/estado` |
| DELETE | `/pedidos/:id`        |

---

## Módulo Comandas (Día 4)

### Archivos creados

```text
restaurante-backend/src/comandas/
├── comanda-estado.enum.ts
├── comanda.entity.ts
├── comandas.module.ts
├── comandas.service.ts
├── comandas.controller.ts
└── dto/
    ├── crear-comanda.dto.ts
    └── cambiar-estado-comanda.dto.ts
```

### Archivo modificado

* `restaurante-backend/src/app.module.ts` — Registro de `ComandasModule` y entidad `Comanda`.

### Relaciones configuradas

| Relación         | Tipo      | Detalle                            |
| ---------------- | --------- | ---------------------------------- |
| Comanda → Pedido | ManyToOne | Una comanda pertenece a un pedido. |

### Funcionalidades implementadas

1. Creación de comandas.
2. Asociación con pedidos existentes.
3. Gestión de estados de cocina.
4. Consulta de comandas registradas.
5. Actualización de estado.
6. Validación de existencia del pedido.

### Endpoints

| Método | Ruta                   |
| ------ | ---------------------- |
| POST   | `/comandas`            |
| GET    | `/comandas`            |
| PATCH  | `/comandas/:id/estado` |

---

## Módulo Tickets (Día 4)

### Archivos creados

```text
restaurante-backend/src/tickets/
├── ticket.entity.ts
├── tickets.module.ts
├── tickets.service.ts
├── tickets.controller.ts
└── dto/
    └── crear-ticket.dto.ts
```

### Archivo modificado

* `restaurante-backend/src/app.module.ts` — Registro de `TicketsModule` y entidad `Ticket`.

### Relaciones configuradas

| Relación        | Tipo     | Detalle                            |
| --------------- | -------- | ---------------------------------- |
| Ticket → Pedido | OneToOne | Cada ticket pertenece a un pedido. |

### Funcionalidades implementadas

1. Generación de tickets desde pedidos.
2. Registro de pagos.
3. Consulta individual de tickets.
4. Validación de existencia del pedido.
5. Almacenamiento del monto total.

### Endpoints

| Método | Ruta                 |
| ------ | -------------------- |
| POST   | `/tickets`           |
| GET    | `/tickets/:id`       |
| PATCH  | `/tickets/:id/pagar` |

---

## Frontend Next.js (Día 4)

### Estructura creada

```text
restaurante-frontend/src/app/
├── page.tsx
├── platos/
│   └── page.tsx
├── mesas/
│   └── page.tsx
└── pedidos/
    └── page.tsx
```

### Página Principal (/)

#### Funcionalidades

* Obtiene información desde el backend mediante Fetch API.
* Muestra estadísticas generales del restaurante.
* Navegación hacia todas las páginas del sistema.
* Manejo de errores de conexión.
* Diseño responsive con Tailwind CSS.
* Carrusel visual de platos típicos.

#### Endpoints consumidos

| Método | Endpoint   |
| ------ | ---------- |
| GET    | `/platos`  |
| GET    | `/mesas`   |
| GET    | `/pedidos` |

---

### Página /platos

#### Funcionalidades

* Listado de platos.
* Creación de nuevos platos.
* Actualización automática después del registro.
* Manejo de errores.
* Visualización de disponibilidad.

#### Endpoints consumidos

| Método | Endpoint  |
| ------ | --------- |
| GET    | `/platos` |
| POST   | `/platos` |

---

### Página /mesas

#### Funcionalidades

* Visualización de mesas mediante tarjetas.
* Cambio de estado en tiempo real.
* Actualización automática de datos.
* Manejo de errores.

#### Estados soportados

* disponible
* ocupada
* reservada

#### Endpoints consumidos

| Método | Endpoint            |
| ------ | ------------------- |
| GET    | `/mesas`            |
| PATCH  | `/mesas/:id/estado` |

---

### Página /pedidos

#### Funcionalidades

* Visualización de pedidos activos.
* Creación de nuevos pedidos.
* Selección de mesa.
* Selección múltiple de platos.
* Actualización automática de la lista.
* Manejo de errores.

#### Endpoints consumidos

| Método | Endpoint   |
| ------ | ---------- |
| GET    | `/pedidos` |
| POST   | `/pedidos` |
| GET    | `/mesas`   |
| GET    | `/platos`  |

---

## Configuración General

### Backend

* NestJS
* TypeORM
* SQLite
* Swagger
* ValidationPipe Global
* CORS habilitado para `http://localhost:3001`

### Frontend

* Next.js 14 (App Router)
* React
* TypeScript
* Tailwind CSS

### Integración

Frontend: `http://localhost:3001`

Backend: `http://localhost:3000`

Comunicación mediante Fetch API entre el frontend y el backend.
