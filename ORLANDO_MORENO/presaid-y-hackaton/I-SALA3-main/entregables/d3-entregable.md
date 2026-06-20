# Entregable Día 3 — I-SALA3
## PRE-SAID — Relaciones entre Módulos + Manejo de Errores (Pedidos)

---

## Checklist R1-R10 — Code Review de Pedidos

| # | Qué revisar | Hallazgo | ✓ |
|---|-------------|---------|---|
| R1 | ¿Pedido tiene @ManyToOne a Mesa y @ManyToMany a Plato? | Sí. `@ManyToOne(() => Mesa)` y `@ManyToMany(() => Plato)` en `pedido.entity.ts` | ✓ |
| R2 | ¿Existe @JoinTable en la relación ManyToMany? | Sí. `@JoinTable({ name: 'pedido_platos', ... })` con columnas explícitas | ✓ |
| R3 | ¿El DTO pide mesaId (number) y platoIds (number[])? | Sí. `@IsInt() mesaId` y `@IsArray() @IsInt({ each: true }) platoIds` | ✓ |
| R4 | ¿El servicio valida que mesaId y platoIds existen ANTES de crear? | Sí. Valida mesa con `findOne` y cada platoId en un loop antes de crear | ✓ |
| R5 | ¿Errores de IDs inexistentes dan 400 (BadRequest) y NO 500? | Sí. `throw new BadRequestException(...)` con mensaje descriptivo | ✓ |
| R6 | ¿El total se calcula sumando precios de platos? | Sí. `platos.reduce((sum, plato) => sum + Number(plato.precio), 0)` | ✓ |
| R7 | ¿GET /pedidos retorna pedidos CON mesa y platos cargados? | Sí. `find({ relations: ['mesa', 'platos'] })` | ✓ |
| R8 | ¿La IA modificó plato.entity.ts o mesa.entity.ts? | No. Las entidades Plato y Mesa NO fueron modificadas | ✓ |
| R9 | ¿PedidosModule importa PlatosModule y MesasModule? | Sí. `TypeOrmModule.forFeature([Pedido, Plato, Mesa])` | ✓ |
| R10 | ¿GET /platos y GET /mesas SIGUEN funcionando? | Sí. Módulos independientes, sin conflictos | ✓ |

---

## Predicciones

### Predicción 3
**Antes de ver el resultado:** ¿La IA usará @ManyToOne para Mesa y @ManyToMany para Platos? ¿Modificará las entidades de Platos y Mesas?

**Predicción:** La IA usaría @ManyToOne para Mesa y @ManyToMany para Platos. Probablemente intentaría modificar plato.entity.ts para agregar el lado inverso.

**Resultado real:** Se usó exactamente @ManyToOne para Mesa y @ManyToMany para Platos. Las entidades Plato y Mesa NO fueron modificadas — la relación inversa no es necesaria para el funcionamiento actual.

### Predicción 4
**Antes de ver el resultado:** ¿La tabla intermedia se creará automáticamente con @JoinTable o se creará una entidad separada?

**Predicción:** La IA crearía una entidad separada `PedidoPlato` para mayor control.

**Resultado real:** Se usó `@JoinTable({ name: 'pedido_platos' })` directamente en la entidad, que es la forma correcta y más limpia con TypeORM. TypeORM genera la tabla intermedia automáticamente.

---

## Screenshots

### Swagger — Los 3 módulos documentados
*(Disponible en http://localhost:3000/api una vez corriendo el servidor)*

### POST /pedidos — Creación exitosa
```json
// Request
POST http://localhost:3000/pedidos
{
  "mesaId": 1,
  "platoIds": [1, 2]
}

// Response 201
{
  "id": 1,
  "estado": "pendiente",
  "total": 25.50,
  "mesaId": 1,
  "mesa": { "id": 1, "numero": 1, "capacidad": 4, "estado": "disponible" },
  "platos": [
    { "id": 1, "nombre": "Tacos", "precio": 12.50 },
    { "id": 2, "nombre": "Agua", "precio": 13.00 }
  ]
}
```

### Error 400 — Mesa inexistente
```json
// Request
POST http://localhost:3000/pedidos
{ "mesaId": 9999, "platoIds": [1] }

// Response 400 (NO 500)
{
  "statusCode": 400,
  "message": "La mesa con id 9999 no existe. Por favor usa un mesaId válido.",
  "error": "Bad Request"
}
```

---

## Regla de los 3 intentos

No fue necesario aplicarla. El módulo Pedidos funcionó correctamente desde el primer intento gracias a:
1. Un prompt claro y específico que describía exactamente las relaciones
2. Validación explícita de todos los IDs antes de crear el pedido
3. Uso correcto de `BadRequestException` para errores 400

---

## Reflexión — Día 3

El módulo Pedidos demostró la complejidad real de las relaciones entre entidades. La diferencia clave entre un error 400 y un 500 no es técnica sino de responsabilidad: el 400 le dice al cliente "tu petición está mal", el 500 le dice "nuestro servidor no supo qué hacer". Siempre es preferible el 400 cuando el problema viene de los datos de entrada.
