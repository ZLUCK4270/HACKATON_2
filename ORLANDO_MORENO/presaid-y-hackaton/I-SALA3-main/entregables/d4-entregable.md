# Entregable Día 4 — I-SALA3
## PRE-SAID — Backend Completo + Frontend con IA

---

## Checklist F1–F7 — Code Review Frontend

| # | Qué revisar | Hallazgo | ✓ |
|---|-------------|---------|---|
| F1 | ¿Las páginas hacen fetch a http://localhost:3000 (backend real)? | Sí. Todas las páginas hacen fetch directo a `http://localhost:3000/{endpoint}`. No hay API routes intermedias en Next.js. | ✓ |
| F2 | ¿Si el backend no responde, muestra mensaje de error (no pantalla blanca)? | Sí. Todas las páginas tienen `try/catch` que captura el error y muestra un mensaje descriptivo con `setError(...)` — nunca pantalla blanca. | ✓ |
| F3 | ¿La navegación funciona entre todas las páginas? | Sí. El componente `Navbar` usa `Link` de Next.js con rutas `/`, `/platos`, `/mesas`, `/pedidos`, `/comandas`, `/tickets`. El path activo se resalta visualmente. | ✓ |
| F4 | ¿El formulario de crear plato realmente crea un plato en el backend? | Sí. Hace `POST /platos` con `Content-Type: application/json`. Tras el 201, refresca la lista automáticamente con `fetchPlatos()`. | ✓ |
| F5 | ¿El cambio de estado de mesa se refleja sin refrescar la página? | Sí. Cada botón "Disponible / Ocupar / Reservar" hace `PATCH /mesas/:id/estado` y llama a `fetchMesas()` para actualizar el estado local sin reload completo. | ✓ |
| F6 | ¿La IA creó componentes reutilizables o repitió código? | Creó un componente `Navbar` compartido. El patrón fetch-load-error-display se repite en cada página (no hay un hook personalizado como `useApi`). Es código funcional pero mejorable con abstracción. | ~ |
| F7 | ¿Los estilos Tailwind se ven coherentes entre páginas? | Sí. Paleta consistente: `slate-900/950` como fondo, `emerald-400` como acento principal, badges de estado con colores semánticos (rojo=ocupada, ámbar=reservada/pendiente, verde=disponible/listo). | ✓ |

---

## Predicciones

### Predicción 5 (Comandas)
**Pregunta:** ¿La IA importará solo PedidosModule o necesitará también PlatosModule y MesasModule?

**Predicción:** Solo necesitaría los repositorios de `Comanda` y `Pedido` — TypeORM resuelve relaciones anidadas con `{ relations: ['pedido.platos', 'pedido.mesa'] }` sin necesidad de importar otros módulos.

**Resultado real:** Exactamente correcto. `ComandasModule` importa `TypeOrmModule.forFeature([Comanda, Pedido])` únicamente. TypeORM carga las relaciones anidadas en una sola query gracias al `relations` array en `findAll()`.

### Predicción 6 (Tickets)
**Pregunta:** ¿La IA hará una query directa a la tabla pedidos o usará el servicio de PedidosModule?

**Predicción:** Query directa con `@InjectRepository(Pedido)` — mejor práctica para evitar dependencias circulares.

**Resultado real:** Correcto. `TicketsService` inyecta directamente el repositorio de `Pedido` y hace `pedidoRepository.find({ where: { mesaId }, relations: ['platos'] })`. Limpio, sin acoplamiento entre módulos.

### Predicción 7 (Frontend)
**Pregunta:** ¿Cuántos archivos creará? ¿Reutilizables? ¿Manejo de errores?

**Predicción:** ~4 páginas + 1 Layout + 1 Navbar. Manejo de errores básico con try/catch.

**Resultado real:** 6 páginas (`/`, `/platos`, `/mesas`, `/pedidos`, `/comandas`, `/tickets`) + 1 `Navbar` + layout global. Manejo de errores con estado `error` en cada página. No creó hooks personalizados (el `useApi` reutilizable no apareció espontáneamente — hay repetición de lógica fetch).

---

## Flujo Completo End-to-End — Resultado

| Paso | Acción | Resultado |
|------|--------|-----------|
| 1 | Crear platos (Tacos, Enchiladas) | ✅ GET /platos retorna 2 platos |
| 2 | Crear mesa (Mesa #1, cap 4) | ✅ GET /mesas retorna Mesa #1 estado `ocupada` |
| 3 | Crear pedido: Mesa 1, platos [Tacos] | ✅ POST /pedidos → 201, total: 99.99 |
| 4 | Ver pedido con relaciones | ✅ GET /pedidos retorna mesa y platos anidados |
| 5 | Crear comanda del pedido | ✅ POST /comandas → estado `recibida`, observaciones OK |
| 6 | Generar ticket de Mesa 1 | ✅ POST /tickets → total sumado, pedidos incluidos |
| 6b | Pagar ticket | ✅ PATCH /tickets/1/pagar → estado `pagado`, metodoPago `tarjeta` |

---

## Módulos Completados — Backend (5/5)

| Módulo | Endpoints | Estado |
|--------|-----------|--------|
| Platos | GET, POST, PATCH, DELETE | ✅ |
| Mesas | GET, POST, PATCH, PATCH/estado, DELETE | ✅ |
| Pedidos | GET, POST, PATCH, PATCH/estado, DELETE | ✅ |
| Comandas | GET, POST, PATCH/estado, DELETE | ✅ |
| Tickets | GET all, GET :id, POST, PATCH/pagar, DELETE | ✅ |

---

## Páginas Frontend — Next.js 14 (6/6)

| Ruta | Descripción | Funcionalidad |
|------|-------------|---------------|
| `/` | Dashboard | Stats de los 5 módulos en tiempo real |
| `/platos` | Carta de Platos | Listar, crear, habilitar/deshabilitar |
| `/mesas` | Control de Mesas | Listar, crear, cambiar estado |
| `/pedidos` | Pedidos Activos | Listar, crear, cambiar estado, eliminar |
| `/comandas` | Cocina | Enviar pedido a cocina, actualizar estado (cocinar/listo) |
| `/tickets` | Caja | Generar cuenta por mesa, pagar (efectivo/tarjeta) |

---

## Reflexión — Día 4

El sistema pasó de ser un backend en Postman a un producto visible en el navegador. Esa transición es el núcleo del vibe coding: en 4 días, de cero a MVP funcional con 5 entidades relacionadas y 6 páginas de frontend.

Dos preguntas quedan abiertas para los días siguientes:
1. **¿Es mantenible?** El código es funcional pero tiene deuda técnica visible: la lógica de fetch se repite en cada página, no hay un estado global compartido, y las interfaces TypeScript están definidas localmente en cada archivo.
2. **¿Está listo para producción?** No. Falta: autenticación, variables de entorno, base de datos persistente (no SQLite con `synchronize: true`), y tests. El Día 5 (deploy) va a exponer exactamente estas grietas.
