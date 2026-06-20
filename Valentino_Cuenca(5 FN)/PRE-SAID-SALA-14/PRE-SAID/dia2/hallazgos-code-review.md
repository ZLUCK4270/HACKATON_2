# Code Review — Día 2: Módulo Mesas

**Alumno:** Valentino Cuenca 5 FN  
**Sala:** I-SALA14  
**Fecha:** 01/06/2026

---

## Lo que la IA hizo BIEN

1. **Entidad completa** — Todos los campos pedidos (id, numero, capacidad, estado, createdAt, updatedAt) con los tipos correctos.
2. **Enum de estados** — EstadoMesa con los 3 valores exactos: disponible, ocupada, reservada.
3. **Unicidad en numero** — `@Column({ unique: true })` aplicado correctamente.
4. **Endpoint PATCH /mesas/:id/estado** — Implementado con un DTO específico (CambiarEstadoDto) y validación con `@IsEnum()`.
5. **Validación de duplicados** — El servicio verifica que no exista una mesa con el mismo número antes de crear y al actualizar.
6. **CRUD completo** — Los 5 endpoints estándar + cambiarEstado, siguiendo la misma estructura que Platos.

## Lo que la IA hizo MAL

1. **Redundancia en validaciones** — `@IsNotEmpty()` + `@IsPositive()` + `@Min(1)` en capacidad es redundante. `@IsPositive()` ya garantiza que sea > 0, y `@Min(1)` también. Bastaba con `@IsInt()` + `@IsPositive()`.
2. **Falta de tipo explícito en capacidad** — En la entidad, `@Column()` sin tipo explícito para capacidad. Funciona en SQLite, pero por claridad y consistencia debería tener `@Column('int')` o similar.
3. **No se agregó validación de conflicto en actualización de estado** — Si una mesa ocupada se intenta cambiar a ocupada otra vez, no hay error (no es grave, pero podría ser una mejora).

## Lo que la IA INVENTÓ (no pedimos)

- **Nada.** Todo lo creado fue exactamente lo solicitado. No se inventó archivos extra ni modificó archivos existentes fuera de lo necesario (AppModule para registrar el módulo y la entidad).

## Predicción vs Realidad

| Aspecto | Predicción | Realidad |
|---------|-----------|----------|
| Archivo de enum separado | Se crearía un archivo enum.ts aparte | El enum está dentro de la entidad (mesa.entity.ts) |
| Validación @IsEnum | Se usaría correctamente | Sí, se usó en CrearMesaDto y CambiarEstadoDto |
| Modificaciones ajenas | Podría modificar platos/ | Solo modificó app.module.ts (necesario) |

## Comparación: Platos (Día 1) vs Mesas (Día 2)

| Aspecto | Platos (Día 1) | Mesas (Día 2) |
|---------|---------------|---------------|
| Code review | No se hizo | Exhaustivo (R1-R8) |
| Validación de unicidad | No aplica (nombre no es único) | Sí, numero único validado |
| Enum de estados | No aplica | Implementado con @IsEnum |
| Endpoint extra | No | PATCH /mesas/:id/estado |
| Validación de duplicados | No | Sí, tanto en crear como actualizar |

### ¿Encontraríamos errores en Platos ahora?

Posibles problemas que podrían estar en Platos (Día 1) y no se detectaron:
1. **No hay validación de nombre duplicado** — Podrían crearse dos platos con el mismo nombre.
2. **El DTO de creación no valida que precio sea mayor a 0 con @Min(1)** — Usa @IsPositive() que sí funciona, pero no hay validación de decimales exactos.
3. **No hay lógica de negocio** — Platos es un CRUD puro sin reglas adicionales, lo cual está bien para el alcance.

---

## Checklist R1-R8

| # | Qué revisar | Hallazgo |
|---|-------------|----------|
| ✅ R1 | ¿La entidad tiene EXACTAMENTE los campos pedidos? | Sí: id, numero, capacidad, estado, createdAt, updatedAt |
| ✅ R2 | ¿El enum de estados existe? ¿Tiene los 3 valores? | Sí: EstadoMesa con disponible, ocupada, reservada |
| ✅ R3 | ¿El campo 'numero' tiene restricción de unicidad? | Sí: @Column({ unique: true }) |
| ✅ R4 | ¿El servicio tiene el método cambiarEstado además del CRUD? | Sí: método cambiarEstado implementado |
| ✅ R5 | ¿El controlador expone PATCH /mesas/:id/estado? | Sí: @Patch(':id/estado') |
| ✅ R6 | ¿Los DTOs validan que 'estado' solo acepte los valores del enum? | Sí: @IsEnum(EstadoMesa) en crear y cambiar-estado DTOs |
| ✅ R7 | ¿La IA modificó archivos que NO le pedimos? | No, solo app.module.ts (necesario para registrar el módulo) |
| ✅ R8 | ¿Hay algo en el código que ninguno de los dos entiende? | No, todo el código es claro y sigue el mismo patrón que Platos |
