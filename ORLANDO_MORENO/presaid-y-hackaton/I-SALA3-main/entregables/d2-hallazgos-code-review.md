# Code Review — Día 2: Módulo Mesas

## Lo que la IA hizo BIEN
- Creó la entidad `Mesa` con todos los campos solicitados (`id`, `numero`, `capacidad`, `estado`, `createdAt`, `updatedAt`).
- Definió correctamente el enum `EstadoMesa` con los tres valores requeridos.
- Añadió validaciones en los DTOs usando `class-validator`.
- Configuró correctamente el módulo y su inyección de dependencias en `AppModule`.

## Lo que la IA hizo MAL
- La IA suele olvidar que en NestJS el campo `estado` debe ser de tipo enum explícito en el DTO con `@IsEnum` para evitar inyecciones de valores erróneos, y esto fue corregido añadiendo correctamente la validación en el DTO.
- A veces, la IA no incluye un manejo estricto de excepciones si el número de mesa se duplica al actualizar, así que tuvimos que asegurar el manejo con `BadRequestException`.

## Lo que la IA INVENTÓ (no pedimos)
- En ocasiones, la IA intenta añadir la importación de `swagger` o `mapped-types` de forma innecesaria en el DTO de actualización. En este caso evitamos que generara configuraciones extrañas controlando estrictamente las dependencias.

## Predicción vs Realidad
- **Predicción:** Pensábamos que la IA iba a crear un archivo extra para el enum `estado.enum.ts` además de los otros archivos y que iba a modificar `app.module.ts`.
- **Realidad:** Efectivamente modificó `app.module.ts` de forma obligatoria para registrar el módulo, pero en cuanto al enum, decidió incrustarlo directamente en el archivo `mesa.entity.ts`, ahorrando un archivo. 

## Comparación: Platos (Día 1) vs Mesas (Día 2)
- El proceso de Code Review de hoy nos hizo mucho más conscientes del peligro de aceptar código a ciegas. 
- En Platos (Día 1), es posible que no hayamos validado correctamente datos negativos para el precio en los DTOs o que el nombre de los platos se repita. Al revisar Mesas, nos damos cuenta de que las validaciones como `@IsPositive()` y `@IsEnum()` son fundamentales, y es probable que Platos carezca de algunas de estas restricciones fuertes.

---

### Checklist de code review completada
#
| Qué revisar | Hallazgo (escribir lo que encuentren) | ✓ |
|-------------|---------------------------------------|---|
| **R1** | **¿La entidad tiene EXACTAMENTE los campos pedidos?** | Sí, todos los campos están presentes y definidos correctamente con TypeORM. | ✓ |
| **R2** | **¿El enum de estados existe? ¿Tiene los 3 valores: disponible, ocupada, reservada?** | Sí, se llama `EstadoMesa` y tiene los 3 valores. | ✓ |
| **R3** | **¿El campo 'numero' tiene restricción de unicidad (@Column({ unique: true }))?** | Sí, está configurado correctamente en TypeORM y manejado en el servicio. | ✓ |
| **R4** | **¿El servicio tiene el método cambiarEstado además del CRUD?** | Sí, recibe el ID y el nuevo estado para actualizar la mesa específica. | ✓ |
| **R5** | **¿El controlador expone PATCH /mesas/:id/estado?** | Sí, se ha expuesto con `@Patch(':id/estado')`. | ✓ |
| **R6** | **¿Los DTOs validan que 'estado' solo acepte los valores del enum?** | Sí, a través del decorador `@IsEnum(EstadoMesa)`. | ✓ |
| **R7** | **¿La IA modificó archivos que NO le pedimos? ¿Cuáles?** | Modificó `app.module.ts`, pero era necesario para inyectar el `MesasModule` y la entidad. | ✓ |
| **R8** | **¿Hay algo en el código que ninguno de los dos entiende?** | No, el código es muy claro y estándar de NestJS. | ✓ |
