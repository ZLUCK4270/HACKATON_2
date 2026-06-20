# Entregable Día 5 — PRE-SAID

**Alumno:** Valentino Cuenca 5 FN
**Sala:** I-SALAX
**Estado:** Completado

---

## 1. Checklist D1-D6 (Verificación en Producción)

| # | Item | Resultado |
|---|------|-----------|
| ✅ D1 | Backend responde `GET /platos` | https://pre-said-sala-14.onrender.com/platos → `[]` |
| ✅ D2 | Swagger funciona | https://pre-said-sala-14.onrender.com/api → UI visible |
| ✅ D3 | Frontend carga | https://pre-said-sala-14.vercel.app → 200 OK |
| ✅ D4 | Frontend muestra platos del backend | Lomo Saltado (S/35) + Ceviche (S/42) visibles en /platos |
| ✅ D5 | Crear pedido desde frontend funciona | Pedido #7 creado: Mesa 1 + Lomo Saltado + Ceviche = S/77 |
| ✅ D6 | URL compartible desde otro dispositivo | Accesible desde ventana de incógnito |

---

## 2. URLs de Producción

| Servicio | URL |
|----------|-----|
| Backend (Render) | https://pre-said-sala-14.onrender.com |
| Frontend (Vercel) | https://pre-said-sala-14.vercel.app |
| Swagger | https://pre-said-sala-14.onrender.com/api |
| Base de datos | PostgreSQL en Render (plan gratis) |

---

## 3. Predicciones

### Predicción 8 — Migración SQLite → PostgreSQL

**Predicción:** *"Al cambiar de SQLite a PostgreSQL, la IA solo modificará la configuración en app.module.ts. No tocará entidades, DTOs ni servicios."*

**Realidad:** Correcto. La IA cambió `TypeOrmModule.forRoot()` para usar `DATABASE_URL` con PostgreSQL como opción principal y SQLite como fallback local. No modificó entidades, DTOs ni servicios en ese cambio. También instaló `pg` y `@nestjs/config` automáticamente. **Predicción correcta.**

**No predicho:** PostgreSQL devuelve columnas `decimal` como strings. Esto rompió `toFixed()` en el frontend. Tuvimos que agregar `transformer: { from: parseFloat }` en las entidades Plato, Pedido y Ticket.

### Predicción 9 — Frontend en producción

**Predicción:** *"El frontend en producción mostrará datos vacíos porque la base de datos de producción no tiene los datos de localhost."*

**Realidad:** Correcto. La base de datos de Render PostgreSQL arrancó vacía. Creamos datos manualmente con `POST /platos` y `POST /mesas` directamente a la URL de producción. **Predicción correcta.**

---

## 4. Errores encontrados en producción

| Error | Causa | Solución |
|-------|-------|----------|
| `precio.toFixed is not a function` | PostgreSQL serializa `decimal` como string | Transformer `from: parseFloat` en todas las entidades con decimal |
| `null value in column "mesa_id"` | FK duplicada: `@Column({ name: 'mesa_id' })` + `@ManyToOne` | Reemplazar por `@JoinColumn({ name: 'mesa_id' })` y eliminar `@Column` redundante |
| Root Directory no existe en Render | Configuramos `presaid-restaurante-backend` | Cambiar a `PRE-SAID/restaurante-backend` |
| Repo privado no accesible desde Render | Permisos de GitHub App | Deploy manual con último commit |

---

## 5. Archivos modificados / creados

| Archivo | Cambio |
|---------|--------|
| `restaurante-backend/src/app.module.ts` | TypeORM config: PostgreSQL via `DATABASE_URL`, SQLite fallback |
| `restaurante-backend/.env.example` | Variables de entorno documentadas |
| `restaurante-frontend/.env.example` | Variables de entorno frontend |
| `restaurante-backend/src/platos/entities/plato.entity.ts` | Transformer `parseFloat` en `precio` |
| `restaurante-backend/src/pedidos/entities/pedido.entity.ts` | Transformer + `@JoinColumn` en lugar de `@Column` redundante |
| `restaurante-backend/src/tickets/entities/ticket.entity.ts` | Transformer + `@JoinColumn` en lugar de `@Column` redundante |
| `restaurante-backend/src/comandas/entities/comanda.entity.ts` | `@JoinColumn` en lugar de `@Column` redundante |
| `restaurante-frontend/src/app/page.tsx` | Hardcode `localhost:3000` reemplazado por `NEXT_PUBLIC_API_URL` |
| `CHANGES.md` | Agregada sección Día 5 con URLs de producción |
| `package.json` | Agregados `pg` y `@nestjs/config` |

---

## 6. STOP — Respuestas a las preguntas orales

**STOP 1 — ¿La IA puso credenciales en algún archivo que se va a commitear?**
Revisamos todo el proyecto. Las credenciales reales (`DATABASE_URL`) solo se configuraron directamente en el dashboard de Render como variable de entorno, nunca en archivos del repo. `.env.example` tiene placeholders. `.env` está en `.gitignore`. La IA respetó esta regla.

**STOP 2 — ¿La IA reemplazó TODOS los hardcodes de localhost en el frontend?**
Casi. La variable `NEXT_PUBLIC_API_URL` ya venía configurada en `src/lib/api.ts` del Día 4. Pero quedó un hardcode en `page.tsx` línea 68 en el mensaje de error del dashboard. Lo corregimos manualmente.

**STOP 3 — ¿El backend responde en la URL pública?**
Sí. `GET https://pre-said-sala-14.onrender.com/platos` responde con array vacío (base de datos nueva). No es error — es esperado.

**STOP 4 — Los datos de localhost NO se transfieren**
Correcto. La base de datos de producción es PostgreSQL nueva. Creamos platos, mesas y pedidos desde cero con `curl` POST a la URL de producción.

**STOP 5 — Abran la URL en el teléfono o incógnito**
La URL del frontend es accesible desde cualquier dispositivo con internet. No requiere estar en la red local. Producción real.

**STOP 6 — Reflexión de cierre de Semana 1**
En 5 días pasamos de cero a un sistema de restaurante completo con 5 módulos backend, frontend y deploy en producción. El sistema funciona, pero no está documentado para que otra persona lo entienda sin hablar con nosotros. Esa es la pregunta que responde la Semana 2.

---

## 7. Comandos usados para crear datos de prueba

```powershell
# Crear platos
Invoke-RestMethod -Uri "https://pre-said-sala-14.onrender.com/platos" -Method Post -Body '{"nombre":"Lomo Saltado","precio":35,"disponible":true}' -ContentType "application/json"

Invoke-RestMethod -Uri "https://pre-said-sala-14.onrender.com/platos" -Method Post -Body '{"nombre":"Ceviche","precio":42,"disponible":true}' -ContentType "application/json"

# Crear mesa
Invoke-RestMethod -Uri "https://pre-said-sala-14.onrender.com/mesas" -Method Post -Body '{"numero":1,"capacidad":4,"estado":"disponible"}' -ContentType "application/json"

# Crear pedido
Invoke-RestMethod -Uri "https://pre-said-sala-14.onrender.com/pedidos" -Method Post -Body '{"mesaId":1,"platoIds":[1,2]}' -ContentType "application/json"
```
