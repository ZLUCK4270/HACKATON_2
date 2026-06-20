# Entregable Día 4 — PRE-SAID

**Alumno:** Valentino Cuenca 5 FN
**Sala:** I-SALA14
**Estado:** Completado

---

## 1. Checklist F1-F7 (Code Review Frontend)

| # | Qué revisar | Resultado |
|---|-------------|-----------|
| ✅ F1 | ¿Las páginas hacen fetch a http://localhost:3000 (backend real)? | Sí, todas las páginas consumen el backend NestJS |
| ✅ F2 | ¿Si el backend no responde, muestra mensaje de error (no pantalla blanca)? | Sí, cada página tiene estado de error con mensaje claro |
| ✅ F3 | ¿La navegación funciona entre todas las páginas? | Sí, NavBar con Link de Next.js, 6 secciones |
| ✅ F4 | ¿El formulario de crear plato realmente crea un plato en el backend? | Sí, hace POST a /platos y refresca la tabla automáticamente |
| ✅ F5 | ¿El cambio de estado de mesa se refleja sin refrescar la página? | Sí, confirmación → PATCH → refetch |
| ✅ F6 | ¿La IA creó componentes reutilizables o repitió código? | NavBar, Notification, ConfirmDialog, LoadingSpinner son reutilizables |
| ✅ F7 | ¿Los estilos Tailwind se ven coherentes entre páginas? | Sí, paleta ámbar/dorado unificada con variables CSS |

---

## 2. Módulos Backend (5/5)

| Módulo | Endpoints principales | Estado |
|--------|-----------------------|--------|
| Platos | GET/POST/PATCH/DELETE /platos | ✅ |
| Mesas | GET/POST /mesas, PATCH /mesas/:id/estado | ✅ |
| Pedidos | GET/POST /pedidos, PATCH /pedidos/:id/estado | ✅ |
| Comandas | GET/POST /comandas, PATCH /comandas/:id/estado | ✅ |
| Tickets | GET/POST /tickets, PATCH /tickets/:id/pagar | ✅ |

**Swagger:** http://localhost:3000/api — 5 módulos documentados.

---

## 3. Páginas Frontend (6/6)

| Página | Descripción | Estado |
|--------|-------------|--------|
| / Dashboard | Contadores de los 5 módulos | ✅ |
| /platos | CRUD completo con búsqueda y filtros | ✅ |
| /mesas | Cards con estado visual y cambio de estado | ✅ |
| /pedidos | Cards tipo ticket con barra de progreso | ✅ |
| /comandas | Vista de cocina con cards por estado | ✅ |
| /tickets | Caja con resumen de recaudación y modal de cobro | ✅ |

---

## 4. Flujo Completo End-to-End

| Paso | Acción | Verificado en |
|------|--------|---------------|
| 1 | Crear platos (Lomo saltado, Ceviche, Ají de gallina) | Frontend /platos |
| 2 | Crear mesas (Mesa 1 cap 4, Mesa 2 cap 2) | Frontend /mesas |
| 3 | Crear pedido: Mesa 1 + platos | Frontend /pedidos |
| 4 | Ver pedido con relaciones (mesa y platos cargados) | Frontend /pedidos |
| 5 | Crear comanda del pedido | POST /comandas |
| 6 | Generar y cobrar ticket de Mesa 1 | Frontend /tickets |

---

## 5. Predicciones

### Predicción 5 — Comandas
**Predicción:** La IA importará solo PedidosModule para acceder al pedido.
**Realidad:** Importó PedidosModule y usó @InjectRepository(Pedido) para validar el pedidoId. No necesitó importar PlatosModule ni MesasModule por separado.

### Predicción 6 — Tickets
**Predicción:** La IA haría una query directa al repositorio de Pedidos para calcular el total.
**Realidad:** Correcto. Usó @InjectRepository(Pedido) y buscó pedidos por mesaId directamente. Evitó dependencias circulares.

### Predicción 7 — Frontend
**Predicción:** La IA crearía entre 10 y 15 archivos con componentes parcialmente reutilizables.
**Realidad:** 6 páginas + layout + 4 componentes compartidos (NavBar, Notification, ConfirmDialog, LoadingSpinner). El fetch se repite por página en lugar de estar en un hook.

---

## 6. Swagger
http://localhost:3000/api — 5 módulos documentados: Platos, Mesas, Pedidos, Comandas, Tickets.
