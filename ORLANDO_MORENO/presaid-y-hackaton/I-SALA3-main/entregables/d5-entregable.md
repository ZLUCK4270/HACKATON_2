# Entregable Día 5 — I-SALA3
## PRE-SAID — Restaurante en Producción

---

## 🔗 URLs de Producción

| Servicio | URL Pública |
|----------|-------------|
| **Backend API** | `https://i-sala3.onrender.com` |
| **Frontend App** | `https://restaurante-frontend-beryl.vercel.app` |
| **Swagger Docs** | `https://i-sala3.onrender.com/api` |

---

## ✅ Checklist D1–D6 — Verificación en Producción

| # | Verificación | Resultado |
|---|--------------|-----------|
| D1 | Backend responde (GET /platos) | ✅ |
| D2 | Swagger funciona en producción | ✅ |
| D3 | Frontend carga correctamente | ✅ |
| D4 | Frontend muestra datos del backend remoto | ✅ |
| D5 | Crear pedido desde frontend funciona | ✅ |
| D6 | URL accesible desde incógnito/teléfono | ✅ |

---

## 🔮 Predicciones

### Predicción 8 (Migración a PostgreSQL)
**Pregunta:** Al cambiar de SQLite a PostgreSQL, ¿qué archivos modificará la IA? ¿Solo la configuración o también las entidades?

**Predicción:** Solo la configuración en `app.module.ts` y las dependencias (instalar `pg`). Las entidades de TypeORM son agnósticas a la base de datos (usan los mismos decoradores `@Entity()`, `@Column()`).

**Resultado real:** Correcto. El código del dominio y la lógica de negocio (entidades, controladores, DTOs) no sufrió ningún cambio. TypeORM abstrajo toda la complejidad de la migración.

### Predicción 9 (Frontend en Producción)
**Pregunta:** ¿El frontend en producción mostrará datos o estará vacío? ¿Los datos de localhost se transfieren a producción?

**Predicción:** Estará completamente vacío al principio. Los datos de SQLite (localhost) no se migran automáticamente a PostgreSQL en la nube, es una base de datos nueva y limpia.

**Resultado real:** Correcto. Hubo que poblar la base de datos de producción desde cero (creando platos, mesas y pedidos nuevos) usando el nuevo frontend público.

---

## 📸 Screenshots (Agregar después de desplegar)

*(Añade aquí un screenshot de tu frontend en Vercel funcionando)*

*(Añade aquí un screenshot del sistema abierto desde tu celular o ventana de incógnito)*
