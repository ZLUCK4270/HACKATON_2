# CHANGES.md — Historial de cambios

## Día 5 — Deploy a producción

### Deploy — Backend (Render)
- Migración de SQLite → PostgreSQL con variables de entorno
- `DATABASE_URL` para conexión a PostgreSQL; fallback a SQLite local
- `@nestjs/config` para gestión de variables de entorno
- `.env.example` con variables documentadas
- Deploy en Render: https://pre-said-sala-14.onrender.com
- Base de datos: PostgreSQL en Render

### Deploy — Frontend (Vercel)
- Variable `NEXT_PUBLIC_API_URL` para entorno
- `.env` y `.env.example` para el frontend
- Deploy en Vercel: https://pre-said-sala-14.vercel.app

### Fixes para producción
- Transformers `decimal → number` en Plato.precio, Pedido.total, Ticket.total
- Eliminación de FK duplicadas (`@Column` redundante con `@ManyToOne`)
- `@JoinColumn({ name })` para nombres de columna explícitos
- Hardcode `http://localhost:3000` reemplazado por `NEXT_PUBLIC_API_URL`

## Día 4 — Backend completo + Frontend Next.js

### Backend — Módulo Comandas
- Nuevo módulo `src/comandas/`
- Entidad `Comanda`: id, pedidoId (FK → Pedido), estado (recibida / en_preparacion / lista), observaciones, createdAt, updatedAt
- `POST /comandas` — crea comanda a partir de un pedidoId (valida que el pedido exista)
- `GET /comandas` — lista todas las comandas con el pedido y sus platos incluidos (relations)
- `PATCH /comandas/:id/estado` — cambia el estado de la comanda
- Validaciones con `class-validator`; errores 400 para pedidoId inexistente

### Backend — Módulo Tickets
- Nuevo módulo `src/tickets/`
- Entidad `Ticket`: id, mesaId (FK → Mesa), total (suma de pedidos), metodoPago (efectivo / tarjeta), estado (abierto / pagado), createdAt
- `POST /tickets` — recibe mesaId, busca todos los pedidos de la mesa y calcula el total automáticamente. Error 400 si la mesa no existe o no tiene pedidos
- `GET /tickets/:id` — retorna el ticket con la mesa y los pedidos incluidos
- `PATCH /tickets/:id/pagar` — cambia estado a "pagado" y registra el metodoPago

### Frontend — Next.js (`restaurante-frontend/`)
- Proyecto Next.js 14 con App Router, TypeScript y Tailwind CSS
- Fuente Inter (Google Fonts) + diseño dark mode premium con paleta ámbar/dorado
- **`/` Dashboard** — tarjetas con totales de platos, mesas y pedidos; botón de actualizar
- **`/platos`** — tabla de platos con búsqueda, filtro por disponibilidad, formulario crear/editar, eliminar con confirmación
- **`/mesas`** — cards tipo plano de sala, cambio de estado (disponible / ocupada / reservada), resumen de ocupación
- **`/pedidos`** — cards tipo ticket con barra de progreso de estado, formulario con selección visual de platos y total estimado
- Componentes: `NavBar`, `Notification`, `ConfirmDialog`, `LoadingSpinner`, `SkeletonCard`
- CORS habilitado en el backend (`app.enableCors()`)
- Fetch a `http://localhost:3000`; manejo de errores en todas las páginas

---

## Día 3 — Pedidos con relaciones

- Módulo `src/pedidos/` con relaciones `@ManyToOne` → Mesa y `@ManyToMany` → Platos
- Tabla intermedia `pedido_platos` con `@JoinTable`
- Cálculo automático del total sumando precios de platos
- `GET /pedidos` retorna pedidos con mesa y platos cargados (`relations: { mesa: true, platos: true }`)
- Errores 400 para IDs inexistentes (pedidoId, mesaId, platoIds)
- Swagger configurado en `http://localhost:3000/api` con los 3 primeros módulos
- Lado inverso de relaciones agregado en `plato.entity.ts` y `mesa.entity.ts`

---

## Día 2 — Mesas

- Módulo `src/mesas/` con CRUD completo
- Entidad `Mesa`: id, numero, capacidad, estado (disponible / ocupada / reservada) — enum
- `PATCH /mesas/:id/estado` — endpoint dedicado para cambiar estado con validación de enum
- Validaciones con `class-validator`

---

## Día 1 — Platos

- Proyecto NestJS inicializado con TypeORM + SQLite
- Módulo `src/platos/` con CRUD completo
- Entidad `Plato`: id, nombre, precio, disponible
- `POST /platos`, `GET /platos`, `GET /platos/:id`, `PATCH /platos/:id`, `DELETE /platos/:id`
