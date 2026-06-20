# Predicciones — RPSoft Hackathon v1
## Dashboard Unificado de Redes Sociales (YouTube)

### Fórmula de tasa de engagement
Engagement (%) = (likes + comentarios) / vistas × 100
- Se divide entre vistas porque el denominador del engagement en YouTube son las reproducciones (views).
- No se divide entre suscriptores porque los suscriptores son el tamaño de la comunidad, no la audiencia del video. Un video puede tener muchas vistas de no suscriptores.
- Si vistas = 0 → NO se divide. Se marca "sin datos".

### ¿Por qué NO usamos search.list?
search.list cuesta 100 unidades de cuota por llamada, mientras que playlistItems.list cuesta 1 unidad. Con 10,000 unidades/día, una sola búsqueda quema el 1% de la cuota. Para listar videos de un canal usamos el uploads playlist (playlistItems.list, 1 unidad) + videos.list (1 unidad por cada 50 IDs). Un jalón completo de 5 canales gasta ~10-15 unidades — insignificante frente a las 10,000 disponibles.

### Crecimiento: absoluto vs tasa %
Para "canal que crece más rápido" usamos TASA de crecimiento (%).
- Crecimiento neto (absoluto) = subs_fin − subs_inicio
- Tasa de crecimiento (%) = (subs_fin − subs_inicio) / subs_inicio × 100
Ejemplo: Canal A (5000 → 5400, +400, 8%) vs Canal B (100000 → 101000, +1000, 1%).
Con absoluto ganaría B (+1000), pero con tasa % gana A (8%). La tasa % refleja mejor el negocio porque mide el esfuerzo relativo: un canal chico que crece 8% está conectando mejor con su audiencia que uno grande que crece 1%.
