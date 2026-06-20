# CHANGES — restaurante-backend

Registro de cambios relevantes del proyecto PRE-SAID · Sala 11.

---

## Día 4 — Backend: Módulos Comandas y Tickets

### Resumen

Se agregó el módulo **Comandas** completo. Se estableció una relación `ManyToOne` con **Pedido**. Las comandas manejan estados (recibida, en_preparacion, lista) y validan el ID del pedido durante la creación. También se configuraron las relaciones anidadas para devolver el pedido y sus platos correspondientes en las peticiones GET, resolviendo las dependencias inyectando directamente los repositorios con `TypeOrmModule.forFeature([Comanda, Pedido])` para mantener el principio de aislamiento sin alterar `PedidosModule`.

### Archivos creados (Comandas)

```
src/comandas/
├── entities/
│   ├── estado-comanda.enum.ts       # Enum: recibida, en_preparacion, lista
│   └── comanda.entity.ts            # Entidad Comanda con ManyToOne a Pedido
├── dto/
│   ├── create-comanda.dto.ts        # DTO para POST /comandas
│   └── update-estado-comanda.dto.ts # DTO para PATCH /comandas/:id/estado
├── comandas.controller.ts           # Endpoints POST, GET y PATCH de estado
├── comandas.service.ts              # Lógica de negocio y validaciones
└── comandas.module.ts               # Módulo de comandas
```

### Archivos modificados (Comandas)

* `src/app.module.ts`: Se importó y registró `ComandasModule` y la entidad `Comanda`.

### Módulo Tickets (Resumen)

Se agregó el módulo **Tickets** completo. Un ticket pertenece a una `Mesa` (ManyToOne). Al crearlo, el sistema valida que la mesa exista y busca todos sus pedidos para sumar el total automáticamente. Si la mesa no tiene pedidos, arroja un error 400 (`BadRequestException`). Se definieron enumeradores para el estado (`abierto`, `pagado`) y métodos de pago (`efectivo`, `tarjeta`). Para aislar las dependencias de otros módulos, se importaron sus respectivos repositorios vía `TypeOrmModule.forFeature([Ticket, Mesa, Pedido])`.

### Archivos creados (Tickets)

```
src/tickets/
├── entities/
│   ├── estado-ticket.enum.ts       # Enum: abierto, pagado
│   ├── metodo-pago.enum.ts         # Enum: efectivo, tarjeta
│   └── ticket.entity.ts            # Entidad Ticket vinculada a Mesa
├── dto/
│   ├── create-ticket.dto.ts        # DTO de creación (requiere mesaId)
│   └── pagar-ticket.dto.ts         # DTO de actualización (requiere metodoPago)
├── tickets.controller.ts           # Endpoints de creación, listado y pago
├── tickets.service.ts              # Reglas de negocio (total automático, validaciones)
└── tickets.module.ts               # Módulo independiente
```

### Archivos modificados (Tickets)

* `src/app.module.ts`: Se registró `TicketsModule` y la entidad `Ticket`.

---

## Día 4 — Frontend: Páginas y Componentes

Se implementó el frontend completo utilizando **Next.js** y **TailwindCSS**, estructurado mediante la App Router de Next.js y organizado en páginas funcionales que interactúan con la API del backend.

### Estructura de Páginas y Componentes

```
restaurante-frontend/src/app/
├── layout.tsx                      # Layout principal con Navbar/Sidebar lateral
├── page.tsx                        # Dashboard con estadísticas y navegación rápida
├── mesas/
│   └── page.tsx                    # Vista y administración de Mesas y estados
├── platos/
│   └── page.tsx                    # Catálogo y registro de Platos y disponibilidad
└── pedidos/
    └── page.tsx                    # Gestión y flujo de Comandas y carrito interactivo
```

### Detalle de Componentes y Páginas

#### 1. Layout Principal (`layout.tsx`)
* **Componente:** `RootLayout`
* **Funcionalidad:**
  * Define la estructura global del sitio con soporte de fuentes locales (`GeistVF` y `GeistMonoVF`).
  * Implementa una barra lateral de navegación interactiva (`Sidebar`) para moverse rápidamente entre el Dashboard, Platos, Mesas y Pedidos.
  * Muestra el estado del servicio en tiempo real ("Servicio Activo") con animaciones tipo pulso.

#### 2. Dashboard (`page.tsx`)
* **Componente:** `DashboardPage`
* **Funcionalidad:**
  * Obtiene estadísticas del backend mediante llamadas concurrentes con `Promise.all` a los endpoints de platos, mesas y pedidos.
  * Muestra tarjetas dinámicas de resumen (Total Platos, Total Mesas, Pedidos Activos).
  * Incluye paneles informativos y de navegación rápida hacia cada sección con efectos hover estilizados.
  * Maneja alertas visuales si ocurre un error de conexión con el servidor backend.

#### 3. Distribución de Mesas (`mesas/page.tsx`)
* **Componente:** `MesasPage`
* **Funcionalidad:**
  * Lista todas las mesas registradas ordenadas por número.
  * Permite alternar y actualizar el estado de cada mesa (Disponible, Ocupada, Reservada) directamente a través de peticiones `PATCH`.
  * Contiene un formulario interactivo para registrar nuevas mesas con validaciones de campos en tiempo real (números positivos, control de duplicados).

#### 4. Menú de Platos (`platos/page.tsx`)
* **Componente:** `PlatosPage`
* **Funcionalidad:**
  * Muestra una tabla con los platos del menú, detallando el ID, nombre, precio y disponibilidad.
  * Permite cambiar la disponibilidad de los platos de forma interactiva (Disponible / No Disponible) vía `PATCH`.
  * Cuenta con un formulario para agregar nuevos platos (nombre, precio, disponibilidad por defecto) con validación de precios positivos.

#### 5. Comandas y Pedidos (`pedidos/page.tsx`)
* **Componente:** `PedidosPage`
* **Funcionalidad:**
  * Muestra el listado de comandas activas agrupando los platos repetidos para una visualización más limpia.
  * Permite transicionar el estado de las comandas (`pendiente` &rarr; `en_preparacion` &rarr; `listo` &rarr; `entregado`) mediante un botón interactivo de acción.
  * Cuenta con un **Creador de Comandas** completo que incluye:
    * Selector de mesa.
    * Selector rápido de platos disponibles en el menú.
    * Un **Carrito de Compra** interactivo donde se puede agregar platos, ajustar cantidades (sumar/restar) o eliminar ítems del pedido.
    * Cálculo automático del total estimado de la comanda antes de enviarla a cocina.

---

## Día 3 — Backend: Módulo Pedidos

### Resumen

Se agregó el módulo **Pedidos** con CRUD completo, relaciones TypeORM con **Mesa** y **Plato**, validación de IDs antes de crear/actualizar, cálculo automático del total y carga de relaciones en las respuestas GET.

### Archivos creados

```
src/pedidos/
├── entities/
│   ├── estado-pedido.enum.ts    # Enum: pendiente, en_preparacion, listo, entregado
│   └── pedido.entity.ts         # Entidad Pedido + relaciones
├── dto/
│   ├── crear-pedido.dto.ts      # mesaId (number), platoIds (number[])
│   ├── actualizar-pedido.dto.ts # mesaId y platoIds opcionales
│   └── cambiar-estado-pedido.dto.ts
├── pedidos.service.ts
├── pedidos.controller.ts
└── pedidos.module.ts
```

### Archivo modificado

- `src/app.module.ts` — Registro de la entidad `Pedido` en TypeORM e import de `PedidosModule`.

### Relaciones configuradas

| Relación | Lado propietario | Detalle |
|----------|------------------|---------|
| **ManyToOne** → Mesa | `Pedido` | `@JoinColumn({ name: 'mesaId' })` — FK en tabla `pedidos` |
| **ManyToMany** → Plato | `Pedido` | `@JoinTable({ name: 'pedido_platos' })` — tabla intermedia `pedido_platos` |

### Entidad `Pedido`

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | number | Autogenerado |
| `mesa` | Mesa | Relación ManyToOne |
| `platos` | Plato[] | Relación ManyToMany |
| `estado` | enum | Default `pendiente` |
| `total` | decimal | Calculado al crear/actualizar platos |
| `createdAt` / `updatedAt` | Date | Automáticos |

### API — `/pedidos`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/pedidos` | Crear pedido |
| `GET` | `/pedidos` | Listar (con `mesa` y `platos` cargados) |
| `GET` | `/pedidos/:id` | Detalle (con relaciones) |
| `PATCH` | `/pedidos/:id` | Actualizar `mesaId` y/o `platoIds` |
| `PATCH` | `/pedidos/:id/estado` | Cambiar estado del pedido |
| `DELETE` | `/pedidos/:id` | Eliminar → **204** |

### Decisiones de diseño

1. **Validación con 400, no 500** — Si `mesaId` o algún `platoId` no existe, el servicio lanza `BadRequestException` (HTTP 400). Pedido no encontrado → `NotFoundException` (404).

2. **Cálculo del total** — Suma de `precio` de cada plato. Si `platoIds` incluye duplicados (ej. `[1, 2, 2]`), cada ocurrencia cuenta para el total y para la relación ManyToMany (cantidades).

3. **Relaciones en GET** — `encontrarTodos()` y `encontrarUno()` usan `relations: { mesa: true, platos: true }` para devolver objetos anidados, no solo IDs.

4. **Repositorios locales** — `PedidosModule` importa `MesasModule` y `PlatosModule` (requisito del ejercicio) y registra `TypeOrmModule.forFeature([Pedido, Mesa, Plato])` para validar existencia con repositorios propios y controlar el código de error (400 vs 404 de los servicios de Mesa/Plato).

5. **Estado inicial** — Al crear, el pedido queda en `pendiente`. El cambio de estado va por `PATCH /pedidos/:id/estado`.

6. **Sin tests** — No se agregaron tests automatizados en este cambio.

7. **Sin cambios en entidades existentes** — `Plato` y `Mesa` permanecen intactas; no se añadió lado inverso.

### Dependencias

**No se instalaron paquetes nuevos.** El módulo reutiliza dependencias ya presentes en `package.json`:

| Paquete | Uso en Pedidos |
|---------|----------------|
| `@nestjs/common` | Controller, Service, excepciones HTTP |
| `@nestjs/typeorm` | `TypeOrmModule`, `@InjectRepository` |
| `typeorm` | Entidad, relaciones, repositorios |
| `class-validator` | Validación de DTOs |
| `class-transformer` | `@Type()` en DTOs numéricos |

### Tablas nuevas (SQLite)

Al arrancar con `synchronize: true`, TypeORM crea:

- `pedidos` — con columna `mesaId`
- `pedido_platos` — tabla intermedia pedido ↔ plato
