# Predicciones y Fundamentos del Modelo de Negocio

## Día 1: Ingesta y Fórmulas
1. **Fórmulas de Engagement y exclusión de suscriptores:**
La fórmula de engagement seleccionada es `(Likes + Comentarios) / Vistas * 100`. Se excluyen los suscriptores como denominador porque el "engagement" (compromiso) mide la efectividad del contenido sobre las personas que *realmente lo vieron*. Muchos suscriptores pueden ser inactivos o cuentas "fantasma" que nunca ven los videos nuevos, por lo que usarlos como denominador distorsionaría la métrica, penalizando injustamente a canales antiguos con grandes comunidades pero bajo alcance orgánico actual.

2. **Justificación de la evasión de `search.list`:**
El endpoint `search.list` de la API de YouTube v3 tiene un costo de cuota extremadamente alto (100 unidades por solicitud) en comparación con otros endpoints. Considerando que la cuota gratuita diaria es de solo 10,000 unidades, usar `search.list` agotaría los recursos con solo 100 llamadas. Para construir un sistema escalable y persistente, la estrategia obligatoria y eficiente es consultar la `playlist de cargas (uploads)` de cada canal mediante el endpoint `playlistitems.list` (1 unidad de costo) y luego obtener las métricas de esos videos mediante `videos.list` (1 unidad por cada 50 IDs).

## Día 2: Tasa de Crecimiento
1. **Uso de la Tasa % sobre el crecimiento absoluto para el ranking:**
Evaluar a los canales por su **crecimiento neto absoluto** siempre favorecerá a los canales más grandes. Por ejemplo, un canal de 10 millones de suscriptores podría ganar 10,000 suscriptores de forma pasiva, mientras que un canal de 10,000 suscriptores requeriría duplicar su tamaño para lograr lo mismo. La **Tasa de Crecimiento Porcentual** normaliza el tamaño de la comunidad, permitiendo identificar canales pequeños o emergentes que tienen tracción viral o estrategias de contenido más efectivas en la actualidad, y ayuda a visualizar alertas de estancamiento de forma proporcional.
