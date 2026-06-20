sala: I-SALA-11
curso: PRE-SAID — Desarrollo Moderno con IA y CLI
dia: 3
estado: en_progreso
loom: (agregar link al terminar)
---
## Bloques
- [x] A — Videos: errores 500, validaciones, anti-patrón parche sobre parche
- [ ] B — Módulo Pedidos con relaciones (Platos + Mesas)
- [ ] C — Manejo de errores + Swagger + CHANGES.md + Loom + PR
## Verificación final
- [ ] POST /pedidos crea un pedido vinculado a una mesa y platos existentes
- [ ] GET /pedidos retorna pedidos con relaciones (mesa y platos incluidos)
- [ ] Errores 400 en vez de 500 cuando faltan datos o IDs no existen
- [ ] GET /platos y GET /mesas siguen funcionando
- [ ] CHANGES.md actualizado
- [ ] feedback_dia3_[tunombre].md completado y commiteado
- [ ] PR creado y enviado a sala par



sala: I-SALAX
curso: PRE-SAID — Desarrollo Moderno con IA y CLI
dia: 2
estado: en_progreso
loom: (agregar link al terminar)
---
## Bloques
- [x] A — Videos: code review y correcciones con IA
- [ ] B — Módulo Mesas con Git branch + code review exhaustivo
- [ ] C — Documentación de hallazgos + Loom + PR
## Verificación final
- [ ] Módulo Mesas funcionando en localhost
- [ ] GET /mesas responde en Postman o navegador
- [ ] Rama feature/mesas mergeada a main
- [ ] Documento de hallazgos del code review completado
- [ ] PR creado y enviado a sala par




Checklist de code review
### Fase 3 — Code Review 

| ID | Qué revisar | Hallazgo | Estado |
| :--- | :--- | :--- | :---: |
| **R1** | ¿Pedido tiene @ManyToOne a Mesa y @ManyToMany a Plato? | *si tiene los 2* | [✔] |
| **R2** | ¿Existe @JoinTable en la relación ManyToMany? | *Si existen los 2* | [✔] |
| **R3** | ¿El DTO pide mesaId (number) y platoIds (number[])? | *Si tiene los tipos definidos* | [✔ ] |
| **R4** | ¿El servicio valida que mesaId y platoIds existen ANTES de crear? | *si tiene las validaciones* | [✔] |
| **R5** | ¿Errores de IDs inexistentes dan 400 (BadRequest) y NO 500? | *si da 404 y no 500* | [✔] |
| **R6** | ¿El total se calcula sumando precios de platos? | *si incluyendo duplicados* | [✔] |
| **R7** | ¿GET /pedidos retorna pedidos CON mesa y platos cargados (relations)? | *si* | [✔] |
| **R8** | ¿La IA modificó plato.entity.ts o mesa.entity.ts? ¿Era necesario? | *no modfico no era necesario* | [✔] |
| **R9** | ¿PedidosModule importa PlatosModule y MesasModule? | *si los importa* | [✔] |
| **R10** | ¿GET /platos y GET /mesas SIGUEN funcionando? | *si* | [✔] |

---