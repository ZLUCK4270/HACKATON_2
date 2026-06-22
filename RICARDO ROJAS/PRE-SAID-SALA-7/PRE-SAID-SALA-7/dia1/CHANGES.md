# CHANGES

## Backend — NestJS (restaurante-backend)

### Módulo Comandas
- `src/comandas/` — CRUD de comandas asociadas a pedidos
- Entidad: `Comanda` con relación ManyToOne a `Pedido`, campos `pedidoId`, `observaciones`, `estado` (recibida/en_preparacion/lista)
- DTOs: `CreateComandaDto`, `UpdateEstadoComandaDto`
- Controlador `@Controller('comandas')` con endpoints: POST `/`, GET `/`, GET `/:id`, PATCH `/:id/estado`, DELETE `/:id`
- Validación: verifica que el `pedidoId` exista antes de crear

### Módulo Tickets
- `src/tickets/` — Gestión de tickets para cobro por mesa
- Entidad: `Ticket` con relación ManyToOne a `Mesa`, campos `mesaId`, `total`, `metodoPago`, `estado` (abierto/pagado), `createdAt`
- DTOs: `CreateTicketDto` (mesaId), `PagarTicketDto` (metodoPago: efectivo/tarjeta)
- Controlador `@Controller('tickets')` con endpoints:
  - `POST /` — Crea ticket buscando pedidos de la mesa y sumando sus totales
  - `GET /` — Lista todos los tickets
  - `GET /:id` — Retorna ticket + mesa + pedidos de esa mesa
  - `PATCH /:id/pagar` — Cambia estado a "pagado" y asigna método de pago
- Validaciones: mesa existe, mesa tiene al menos un pedido, ticket no está ya pagado
- Dependencias: `MesasModule`, `PedidoRepository`

### CORS
- Habilitado en `main.ts` con `app.enableCors({ origin: 'http://localhost:3000' })`

---

## Frontend — Next.js 14 (restaurante-frontend)

### Layout principal (`src/app/layout.tsx`)
- Barra de navegación con links a Dashboard, Platos, Mesas, Pedidos, Comandas, Tickets
- Metadata: título "Sistema de Restaurante"

### Dashboard (`src/app/page.tsx`)
- 3 tarjetas resumen: Total Platos, Total Mesas, Pedidos del día (fetchea los 3 endpoints)
- 3 tarjetas de navegación rápida a cada sección
- Componente `"use client"` — muestra error si el backend no responde

### Página Platos (`src/app/platos/page.tsx`)
- Tabla con columnas: nombre, precio, disponible
- Formulario para crear plato (nombre, precio, checkbox disponible)
- Fetch a `GET /platos` y `POST /platos`
- Manejo de error con banner descartable

### Página Mesas (`src/app/mesas/page.tsx`)
- Cards con: número de mesa, capacidad, estado (borde y badge color según estado)
- Botón "Cambiar a siguiente estado" (disponible → ocupada → reservada → disponible)
- Fetch a `GET /mesas` y `PATCH /mesas/:id/estado`

### Página Pedidos (`src/app/pedidos/page.tsx`)
- Lista de pedidos con: número, mesa, platos, estado (badge color), total
- Formulario para crear pedido: selector de mesa + botones toggle para platos
- Fetch a `GET /pedidos`, `GET /mesas`, `GET /platos`, `POST /pedidos`

### Página Comandas (`src/app/comandas/page.tsx`)
- Lista de comandas con: id, pedido, mesa, platos, estado (badge), observaciones
- Formulario para crear comanda: selector de pedido + observaciones
- Botón "Pasar a siguiente estado" (recibida → en_preparacion → lista)
- Botón eliminar con confirmación
- Fetch a `GET /comandas`, `GET /pedidos`, `POST /comandas`, `PATCH /comandas/:id/estado`, `DELETE /comandas/:id`

### Página Tickets (`src/app/tickets/page.tsx`)
- Lista de tickets con: id, mesa, total, estado (badge), método de pago
- Formulario para crear ticket: selector de mesa, genera ticket sumando pedidos
- Expandir ticket para ver pedidos de la mesa
- Botón "Pagar" con selector de método de pago (efectivo/tarjeta)
- Fetch a `GET /tickets`, `GET /mesas`, `POST /tickets`, `PATCH /tickets/:id/pagar`, `GET /tickets/:id`

### General
- Tailwind CSS para estilos
- Componentes Client (`"use client"`) para interactividad
- API base configurada a `http://localhost:3001`
- Manejo de errores: si el backend no responde, muestra banner en rojo con mensaje claro
- Navegación con `Link` de Next.js entre páginas
