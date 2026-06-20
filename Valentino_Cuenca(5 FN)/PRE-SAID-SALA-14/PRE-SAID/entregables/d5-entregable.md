# Entregable Día 5 — PRE-SAID

**Alumno:** Valentino Cuenca 5 FN
**Sala:** I-SALAX
**Estado:** Completado

---

## 1. URLs de Producción

| Servicio | URL |
|----------|-----|
| Backend (Render) | https://pre-said-sala-14.onrender.com |
| Frontend (Vercel) | https://pre-said-sala-14.vercel.app |
| Swagger | https://pre-said-sala-14.onrender.com/api |
| Base de datos | PostgreSQL en Render |

---

## 2. Checklist D1-D6 (Verificación en Producción)

| # | Item | Resultado |
|---|------|-----------|
| ✅ D1 | Backend responde GET /platos | Array vacío (DB nueva) |
| ✅ D2 | Swagger funciona | UI visible en /api |
| ✅ D3 | Frontend carga | 200 OK desde Vercel |
| ✅ D4 | Frontend muestra platos del backend | Lomo Saltado + Ceviche visibles |
| ✅ D5 | Crear pedido desde frontend | Pedido #7: Lomo Saltado + Ceviche = S/77 |
| ✅ D6 | URL compartible desde otro dispositivo | Accesible desde incógnito/teléfono |

---

## 3. Predicciones

### Predicción 8 — Migración SQLite → PostgreSQL
**Predicción:** La IA solo modificará app.module.ts. No tocará entidades, DTOs ni servicios.
**Realidad:** Correcto. Solo cambió TypeOrmModule.forRoot() para usar DATABASE_URL con PostgreSQL y SQLite como fallback. Instaló pg y @nestjs/config.

### Predicción 9 — Frontend en producción
**Predicción:** El frontend mostrará datos vacíos porque la DB de producción no tiene los datos de localhost.
**Realidad:** Correcto. Creamos datos manualmente con POST directo a la URL de Render.

---

## 4. Errores encontrados en producción

| Error | Causa | Solución |
|-------|-------|----------|
| precio.toFixed is not a function | PostgreSQL serializa decimal como string | Transformer from: parseFloat en entidades |
| null value in column "mesa_id" | FK duplicada: @Column + @ManyToOne | @JoinColumn y eliminar @Column redundante |
| Root Directory incorrecto | Configuramos presaid-restaurante-backend | Cambiar a PRE-SAID/restaurante-backend |

---

## 5. Archivos modificados

| Archivo | Cambio |
|---------|--------|
| restaurante-backend/src/app.module.ts | TypeORM: PostgreSQL via DATABASE_URL, SQLite fallback |
| restaurante-backend/.env.example | Variables de entorno documentadas |
| restaurante-frontend/.env.example | Variables de entorno frontend |
| src/platos/entities/plato.entity.ts | Transformer parseFloat en precio |
| src/pedidos/entities/pedido.entity.ts | Transformer + @JoinColumn |
| src/tickets/entities/ticket.entity.ts | Transformer + @JoinColumn |
| src/comandas/entities/comanda.entity.ts | @JoinColumn en lugar de @Column redundante |
| restaurante-frontend/src/app/page.tsx | Hardcode localhost → NEXT_PUBLIC_API_URL |
| CHANGES.md | Sección Día 5 con URLs de producción |
| package.json | Agregados pg y @nestjs/config |

---

## 6. Flujo Completo End-to-End en Producción

| Paso | Acción |
|------|--------|
| 1 | POST /platos: Lomo Saltado (S/35) + Ceviche (S/42) |
| 2 | POST /mesas: Mesa 1, capacidad 4 |
| 3 | POST /pedidos: Mesa 1 + platos 1 y 2 = S/77 |
| 4 | GET /pedidos/:id verifica relaciones mesa + platos |
