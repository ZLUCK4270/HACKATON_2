# Entregable Día 4 — PRE-SAID

**Alumno:** Valentino Cuenca 5 FN
**Sala:** I-SALA14
**Estado:** Completado

---

## 1. Checklist F1-F7 (Code Review Frontend)

| # | Qué revisar | Resultado |
|---|-------------|-----------|
| ✅ F1 | ¿Las páginas hacen fetch a `http://localhost:3000` (backend real)? | Sí, todas las páginas consumen el backend NestJS |
| ✅ F2 | ¿Si el backend no responde, muestra mensaje de error (no pantalla blanca)? | Sí, cada página tiene su propio estado de error con mensaje claro |
| ✅ F3 | ¿La navegación funciona entre todas las páginas? | Sí, NavBar con Link de Next.js, estado activo destacado |
| ✅ F4 | ¿El formulario de crear plato realmente crea un plato en el backend? | Sí, hace POST a /platos y refresca la tabla automáticamente |
| ✅ F5 | ¿El cambio de estado de mesa se refleja sin refrescar la página? | Sí, confirmación → PATCH → refetch en el mismo componente |
| ✅ F6 | ¿La IA creó componentes reutilizables o repitió código? | Parcialmente: NavBar, Notification, ConfirmDialog y LoadingSpinner son reutilizables. El fetch se repite por página |
| ✅ F7 | ¿Los estilos Tailwind se ven coherentes entre páginas? | Sí, paleta unificada con variables CSS compartidas |

---

## 2. Módulos Backend (5/5)

| Módulo | Endpoints principales | Estado |
|--------|-----------------------|--------|
| Platos | GET, POST, PATCH, DELETE /platos | ✅ |
| Mesas | GET, POST, PATCH /mesas/:id/estado | ✅ |
| Pedidos | GET, POST, PATCH /pedidos/:id/estado + relaciones | ✅ |
| Comandas | GET, POST /comandas, PATCH /comandas/:id/estado | ✅ |
| Tickets | GET /tickets/:id, POST /tickets, PATCH /tickets/:id/pagar | ✅ |

**Swagger:** http://localhost:3000/api — 5 módulos documentados.

---

## 3. Flujo Completo End-to-End

| Paso | Acción | Verificado en |
|------|--------|---------------|
| 1 | Crear platos (Lomo saltado, Ceviche, Ají de gallina) | Frontend /platos |
| 2 | Crear mesas (Mesa 1 cap 4, Mesa 2 cap 2) | Frontend /mesas |
| 3 | Crear pedido: Mesa 1 + Lomo saltado + Ceviche | Frontend /pedidos |
| 4 | Ver pedido con relaciones (mesa y platos cargados) | Frontend /pedidos + GET /pedidos |
| 5 | Crear comanda del pedido 1 | POST /comandas {"pedidoId": 1} |
| 6 | Generar ticket de Mesa 1 | POST /tickets {"mesaId": 1} |

---

## 4. Predicciones

### Predicción 5 — Comandas
**Predicción:** La IA importará solo PedidosModule para acceder al pedido.
**Realidad:** Importó PedidosModule y usó @InjectRepository(Pedido) directamente en el servicio de Comandas para validar que el pedidoId exista antes de crear la comanda. No necesitó importar PlatosModule ni MesasModule por separado porque las relaciones ya vienen cargadas desde el pedido.

### Predicción 6 — Tickets
**Predicción:** La IA haría una query directa al repositorio de Pedidos para calcular el total.
**Realidad:** Correcto. Usó @InjectRepository(Pedido) y buscó pedidos filtrando por mesaId directamente, sin pasar por el servicio de PedidosModule. Es discutible si es mejor práctica, pero funcionó y evitó dependencias circulares.

### Predicción 7 — Frontend
**Predicción:** La IA crearía entre 10 y 15 archivos con componentes parcialmente reutilizables.
**Realidad:** Generó 4 páginas + layout + 4 componentes compartidos. El manejo de errores y el fetch se repiten en cada página en lugar de estar abstraídos en un hook. Menos reutilización de la esperada, pero el código es legible.

---

## 5. Swagger
http://localhost:3000/api — 5 módulos documentados: Platos, Mesas, Pedidos, Comandas, Tickets.

---

## 6. STOP — Respuestas a las preguntas orales

**STOP 1 — ¿Por qué Comandas fue más rápido que Pedidos?**
Porque no tenía relaciones ManyToMany que configurar. Una relación simple ManyToOne es mucho más directa. El patrón se vuelve repetitivo y eso es una señal de alerta: cuando algo es muy repetitivo, uno deja de leerlo con atención y ahí es cuando aparecen los errores.

**STOP 2 — ¿La documentación de Swagger alcanza?**
Para que alguien use la API sí, los endpoints están todos. Para que entiendan las decisiones de diseño no. Faltaría documentar las reglas de negocio, no solo los endpoints.

**STOP 4 — ¿Ven datos reales del backend en el navegador?**
Sí. Los platos y mesas creados en días anteriores aparecieron en el frontend sin ningún ajuste adicional. Fue el momento más satisfactorio del curso hasta ahora.

**STOP 6 — ¿Es este sistema mantenible a 6 meses?**
Probablemente no sin trabajo extra. El código funciona pero no está documentado a nivel de decisiones. Si alguien nuevo agarra el repo, puede ver los endpoints en Swagger, pero no sabe por qué se eligió SQLite, por qué el estado de mesa es un enum con esos tres valores específicos, ni cómo se espera que escale. CHANGES.md ayuda pero no alcanza.
