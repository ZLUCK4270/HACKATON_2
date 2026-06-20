# Entregable Día 1 — PRE-SAID
**Alumno:** Valentino Cuenca 5 FN  
**Sala:** I-SALA14  
**Estado:** Completado

## 1. Gemini CLI funcionando
Gemini CLI v0.44.1 instalado y autenticado con cuenta @gmail. Se creó y borró archivo `prueba.txt` correctamente.

## 2. Predicción vs Realidad
- **Predicción:** Crearía: plato.entity.ts, plato.controller.ts, plato.service.ts, plato.module.ts, create-plato.dto.ts, update-plato.dto.ts
- **Realidad:** Creó exactamente esos archivos + actualizó app.module.ts y package.json

## 3. Checklist V1-V7
| Criterio | Resultado |
|---|---|
| V1: Entidad con id, nombre, precio, disponible, createdAt, updatedAt | ❌ Falta `disponible`, `createdAt`, `updatedAt`; sobra `descripcion` |
| V2: Sin campos inventados | ❌ La IA inventó el campo `descripcion` |
| V3: DTOs con validaciones reales | ❌ Sin decoradores `@IsString`, `@IsNumber`, etc. |
| V4: 5 endpoints REST | ✅ |
| V5: Módulo registrado en AppModule | ✅ |
| V6: No se modificaron archivos extra | ✅ |
| V7: Sin llaves secretas ni URLs hardcodeadas | ✅ |

## 4. Comparación CLI vs IDE
| Aspecto | CLI (Gemini) | IDE (Cursor) |
|---|---|---|
| Control | Mayor control sobre el filesystem | Visual, más amigable |
| Velocidad | Rápido para comandos secuenciales | Rápido para edición visual |
| Transparencia | Se ve cada paso en terminal | El agente trabaja internamente |
| Automatización | Ideal para tareas repetitivas | Ideal para exploración |

## 5. GET /platos responde
El servidor NestJS corre en `http://localhost:3000`. Endpoint `GET /platos` responde correctamente.

---

## 6. Correcciones aplicadas (rama `presaid-d1-fixes-nick`)

La IA generó el módulo incompleto respecto a lo especificado en el documento. Se corrigió:

| Archivo | Problema | Solución |
|---|---|---|
| `plato.entity.ts` | Faltaban `disponible`, `createdAt`, `updatedAt`; sobraba `descripcion`; sin decoradores TypeORM | Entity con TypeORM decorators y campos exactos |
| `create-plato.dto.ts` | Sin validaciones `class-validator`; campo `descripcion` extra | Decoradores `@IsString`, `@IsNumber`, `@IsBoolean`, etc. |
| `platos.service.ts` | Usaba arreglo en memoria | Cambiado a `Repository<Plato>` con TypeORM |
| `platos.module.ts` | Sin `TypeOrmModule.forFeature([Plato])` | Agregado |
| `app.module.ts` | Sin configuración TypeORM | Agregado `TypeOrmModule.forRoot` con SQLite |
| `main.ts` | Sin `ValidationPipe` global | Agregado con `whitelist`, `forbidNonWhitelisted`, `transform` |
| `package.json` | Faltaban dependencias | Agregadas `class-validator`, `typeorm`, etc. |

**Lección:** El prompt fue correcto, pero la IA omitió partes clave. El Navigator debe revisar contra la spec línea por línea. No aceptar solo porque "funciona".
