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
### Fase 3 — Code Review Exhaustivo: Módulo Mesas

| ID | Qué revisar | Hallazgo | Estado |
| :--- | :--- | :--- | :---: |
| **R1** | ¿La entidad tiene EXACTAMENTE los campos pedidos? | *Si cumple con lo solicitado* | [✔] |
| **R2** | ¿El enum de estados existe? ¿Tiene los 3 valores: disponible, ocupada, reservada? | *Si existes y tiene los 3 valores* | [✔] |
| **R3** | ¿El campo `numero` tiene restricción de unicidad (`@Column({ unique: true })`)? | *Si tiene la restriccion* | [✔ ] |
| **R4** | ¿El servicio tiene el método `cambiarEstado` además del CRUD? | *Si tiene el metodo de cambiarEstado * | [✔] |
| **R5** | ¿El controlador expone `PATCH /mesas/:id/estado`? | *Si si lo expone* | [✔] |
| **R6** | ¿Los DTOs validan que 'estado' solo acepte los valores del enum (`@IsEnum()`)? | *Si hay un ternario y lo pasan como propiedad* | [✔] |
| **R7** | ¿La IA modificó archivos que NO le pedimos? ¿Cuáles? | *no* | [✔] |
| **R8** | ¿Hay algo en el código que ninguno de los dos entiende? | *si* | [ ] |

---