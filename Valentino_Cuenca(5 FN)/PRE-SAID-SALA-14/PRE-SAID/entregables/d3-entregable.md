# Entregable Día 3 — PRE-SAID

**Alumno:** Valentino Cuenca 5 FN
**Sala:** I-SALA14
**Estado:** Completado

---

## 1. Checklist R1-R11 (Módulo Pedidos)

| # | Qué revisar | Resultado |
|---|-------------|-----------|
| ✅ R1 | ¿Pedido tiene @ManyToOne a Mesa y @ManyToMany a Plato? | Sí |
| ✅ R2 | ¿Existe @JoinTable en la relación ManyToMany? | Sí, tabla intermedia pedido_platos |
| ✅ R3 | ¿El DTO pide mesaId (number) y platoIds (number[])? | Sí, con validaciones class-validator |
| ✅ R4 | ¿El servicio valida que mesaId y platoIds existen ANTES de crear? | Sí, con BadRequestException |
| ✅ R5 | ¿Errores de IDs inexistentes dan 400 (BadRequest) y NO 500? | Sí |
| ✅ R6 | ¿El total se calcula sumando precios de platos? | Sí |
| ✅ R7 | ¿GET /pedidos retorna pedidos CON mesa y platos cargados? | Sí, con relations: { mesa: true, platos: true } |
| ✅ R8 | ¿La IA modificó plato.entity.ts o mesa.entity.ts? ¿Era necesario? | Sí, agregó lado inverso de relación (necesario) |
| ✅ R9 | ¿PedidosModule importa PlatosModule y MesasModule? | Sí |
| ✅ R10 | ¿PlatosModule y MesasModule exportan TypeOrmModule? | Sí |
| ✅ R11 | ¿GET /platos y GET /mesas SIGUEN funcionando? | Sí |

---

## 2. Predicciones

### Predicción 3 — Relaciones
**Predicción:** La IA usará @ManyToOne para Mesa y @ManyToMany para Platos, y modificará las entidades de Platos y Mesas para agregar el lado inverso.
**Realidad:** Correcto. @ManyToOne con Mesa, @ManyToMany con Plato, @JoinTable con tabla pedido_platos. Agregó @OneToMany en Mesa y @ManyToMany (inversa) en Plato.

### Predicción 4 — Tabla intermedia
**Predicción:** La IA creará la tabla intermedia automáticamente con @JoinTable.
**Realidad:** Correcto. Usó @JoinTable con nombre pedido_platos, joinColumn e inverseJoinColumn explícitos. Exportó TypeOrmModule en PlatosModule y MesasModule.

---

## 3. Regla de los 3 intentos
No fue necesario aplicar la regla. La IA generó el módulo Pedidos correctamente en el primer intento con validaciones y errores 400.

---

## 4. Swagger
Swagger configurado en http://localhost:3000/api mostrando todos los endpoints de Platos, Mesas y Pedidos.

---

## 5. Verificación de endpoints

```
POST /pedidos  {"mesaId": 1, "platoIds": [1, 2]}  → 201 Created, total calculado ✅
GET  /pedidos                                       → pedidos con mesa y platos incluidos ✅
POST /pedidos  {"mesaId": 99, "platoIds": [1]}     → 400 BadRequest ✅
GET  /platos                                        → sigue funcionando ✅
GET  /mesas                                         → sigue funcionando ✅
```
