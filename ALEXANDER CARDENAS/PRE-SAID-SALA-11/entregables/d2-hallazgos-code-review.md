# Code Review — Día 2: Módulo Mesas
## Lo que la IA hizo BIEN
(listar con explicación breve)
-Creacion del CRUD completamente funcional mas endpoint para su uso.
-Carpeta propia mesas/ — No mezcló mesas con platos; cada módulo tiene su controlador, servicio, entidad y DTOs.
-Enum de estados — Archivo aparte con disponible, ocupada y reservada (R2).
-Número de mesa único — En la entidad y comprobación al crear/actualizar para no repetir el mismo número

## Lo que la IA hizo MAL
(listar: qué era, por qué está mal, cómo lo corrigieron)
-No registrar Mesa en la configuración global de la base de datos (app.module.ts solo tenía Plato).
-El módulo de mesas “sí veía” la entidad, pero la app en conjunto no la tenía cargada. Por eso al hacer GET /mesas salía el error “No metadata for Mesa was found” y la API fallaba.



## Lo que la IA INVENTÓ (no pedimos)
(listar: qué fue, ¿era necesario o no?)
-createdAt y updatedAt en la mesa
No suele pedirse en el enunciado mínimo, pero ya estaban en Platos; la IA copió el mismo patrón. Útil, no molesta.
-Método privado validarNumeroUnico + mensaje de conflicto si el número ya existe
No siempre está en el prompt, pero encaja con “número único”. Evita errores feos de base de datos. Sí tiene sentido.
-Valor por defecto disponible al crear
Comodidad; si no mandas estado, la mesa queda disponible. Razonable.


## Predicción vs Realidad
(qué predijeron, qué pasó realmente)
-Predijeron (día 2): que Mesas traería más archivos que Platos por el enum y el campo único numero

-Acertamos: carpeta mesas/ paralela a platos/, archivo estado-mesa.enum.ts, un DTO más (cambiar-estado-mesa.dto.ts), endpoint y método de cambiar estado.
No anticipamos del todo el fallo: que al agregar una entidad nueva hay que sumarla también en app.module.ts, no solo en el módulo de mesas. Eso salió al probar GET /mesas, no solo leyendo archivos.

## Comparación: Platos (Día 1) vs Mesas (Día 2)
(¿La revisión cambió la calidad del resultado? ¿Encontraron algo en Mesas que probablemente también está mal en Platos?)
-En Día 2 revisaron punto por punto . Eso ayudó a confirmar requisitos, pero el error grave se vio probando la API, no solo tachando casillas.
Código generado
Mesas quedó más completo que Platos (estados, ruta extra, validación de enum, unicidad de número). La estructura es la misma; el dominio es más rico.

-El mismo tipo de olvido: cada entidad nueva debe ir en app.module.ts. Platos no falló porque Plato ya estaba desde el día 1. Si mañana agregan Pedidos y solo hacen forFeature en su módulo, repetirán el mismo error si no actualizan entities: [...].
Entendimiento del equipo
