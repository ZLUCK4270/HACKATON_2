# CHANGES.md — Restaurante Backend & Frontend

## Deploy — Día 5
- Backend: `https://i-sala3.onrender.com`
- Frontend: `https://restaurante-frontend-beryl.vercel.app`
- Swagger: `https://i-sala3.onrender.com/api`
- Base de datos: PostgreSQL en Render

## Día 4 — Backend Completo + Frontend Next.js

### Módulo Comandas (Backend)
- Entidad Comanda con ManyToOne a Pedido, enum EstadoComanda (recibida/en_preparacion/lista)
- DTOs create y update con validaciones
- Servicio valida pedidoId, crea comanda, retorna relaciones anidadas pedido.mesa y pedido.platos
- Controlador REST CRUD

### Módulo Tickets (Backend)
- Entidad Ticket: ManyToOne a Mesa, ManyToMany a Pedido, enums MetodoPago y EstadoTicket
- POST /tickets busca todos los pedidos de la mesa y suma totales
- PATCH /tickets/:id/pagar para abonar el ticket

### Frontend Next.js (restaurante-frontend/)
- 6 páginas completas (Dashboard, Platos, Mesas, Pedidos, Comandas, Tickets) con estado cliente
- UI construida con Tailwind CSS y Lucide Icons

## Día 3 — Módulo Pedidos con Relaciones
- Entidad Pedido con relaciones ManyToOne (Mesa) y ManyToMany (Plato)
- Suma de total en tiempo real
- TypeOrmModule importa directamente los repositorios para evitar dependencias circulares

## Día 2 — Módulo Mesas
- CRUD completo de mesas con estados (disponible, ocupada, reservada)
- PATCH /mesas/:id/estado

## Día 1 — Módulo Platos
- CRUD inicial con NestJS y SQLite
