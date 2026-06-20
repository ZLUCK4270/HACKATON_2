# Día 1 — Entregable PRE-SAID
**Alumno:** Valentino Cuenca 5 FN  
**Sala:** I-SALA14  
**Fecha:** 01/06/2026

---

## 1. Screenshot Gemini CLI funcionando
Gemini CLI v0.44.1 instalado y autenticado con Google. Se creó `prueba.txt` con texto "Gemini CLI funciona" y se eliminó correctamente.

## 2. Predicción vs Realidad

### Predicción (archivos esperados):
1. `src/platos/plato.entity.ts`
2. `src/platos/dto/crear-plato.dto.ts`
3. `src/platos/dto/actualizar-plato.dto.ts`
4. `src/platos/platos.service.ts`
5. `src/platos/platos.controller.ts`
6. `src/platos/platos.module.ts`
7. `src/app.module.ts` (modificado)

### Realidad (archivos creados):
1. `src/platos/entities/plato.entity.ts` ✓
2. `src/platos/dto/crear-plato.dto.ts` ✓
3. `src/platos/dto/actualizar-plato.dto.ts` ✓
4. `src/platos/platos.service.ts` ✓
5. `src/platos/platos.controller.ts` ✓
6. `src/platos/platos.module.ts` ✓
7. `src/app.module.ts` (modificado) ✓
8. `src/main.ts` (modificado con ValidationPipe) ✓

**Acierto:** 7/8 — No predije la modificación de `main.ts`.

## 3. Checklist V1–V7

| Criterio | Estado |
|----------|--------|
| V1: Entidad con id, nombre, precio, disponible, createdAt, updatedAt | ✅ |
| V2: Sin campos inventados por la IA | ✅ |
| V3: DTOs con validaciones (@IsString, @IsNumber, etc.) | ✅ |
| V4: 5 endpoints: POST, GET all, GET :id, PATCH :id, DELETE :id | ✅ |
| V5: Módulo registrado en AppModule | ✅ |
| V6: No se modificaron archivos que no pedimos | ✅ |
| V7: Sin llaves secretas ni URLs hardcodeadas | ✅ |

## 4. Comparación CLI vs IDE

### ¿En cuál sentiste más control?
**CLI (Gemini).** Ves cada comando que ejecuta, cada archivo que modifica. Hay transparencia total.

### ¿En cuál fuiste más rápido?
**IDE (Cursor).** El modo Agent crea múltiples archivos simultáneamente. Más rápido para generar estructura.

### ¿En cuál entendiste mejor lo que la IA hacía?
**CLI.** Muestra paso a paso lo que hace. En IDE a veces todo aparece de golpe.

### Para automatizar tareas repetitivas, ¿CLI o IDE?
**CLI.** Se puede encadenar con scripts y tiene modo headless (`-p`). Ideal para CI/CD.

## 5. Screenshot GET /platos
```
$ curl.exe -s http://localhost:3000/platos
[]
```
Responde correctamente con arreglo vacío (no hay platos creados aún).
