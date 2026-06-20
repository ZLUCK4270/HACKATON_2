# Feedback Día 3 — Valentino Cuenca 5 FN

**Sala:** I-SALA14
**Fecha:** 06/06/2026

---


1. **¿Las relaciones (ManyToOne, ManyToMany) fueron difíciles para la IA o las hizo bien?**
   La verdad que las hizo bien, mejor de lo que esperaba. Generó el `@ManyToOne` para Mesa y el `@ManyToMany` para Platos sin que yo tuviera que corregirle nada. También agregó solo el `@JoinTable` con el nombre de la tabla intermedia y las columnas, que es algo que yo mismo no hubiera sabido poner de memoria. Lo que más me sorprendió es que también modificó las entidades de Platos y Mesas para agregar el lado inverso de las relaciones, que es algo que te podés olvidar fácilmente y después te rompe las queries.

2. **¿La IA rompió Platos o Mesas al crear Pedidos?**
   No. Fue algo que me preocupaba antes de correr el código, porque cuando la IA toca archivos que ya funcionan siempre hay chances de que meta algo raro. Pero en este caso solo agregó lo necesario al final de cada entidad y no tocó nada de lo que ya estaba. Después de generar verifiqué que `GET /platos` y `GET /mesas` seguían respondiendo bien y sí, todo intacto.

3. **¿Los comandos curl para testing fueron útiles?**
   Sí, aunque al principio me costó un poco armar el JSON con los IDs correctos. Una vez que entendí el formato fue rápido verificar que el endpoint andaba. Lo bueno es que con curl ves exactamente qué responde el servidor sin depender de ninguna interfaz gráfica.

4. **¿La regla de los 3 intentos es clara? ¿La aplicaron?**
   Sí, la entiendo bien: si en tres intentos la IA no resuelve algo, parás y pedís ayuda en lugar de seguir prompting al divino botón. En este día no tuve que aplicarla porque el módulo de Pedidos salió bien al primer intento. Pero me parece una buena regla para no quedarse atascado una hora sola con la IA cuando el problema puede ser otro.

5. **¿Swagger fue fácil de configurar?**
   Sí, lo más simple del día. Instalar `@nestjs/swagger` y `swagger-ui-express`, agregar las pocas líneas en el `main.ts` y listo. Después entrar a `localhost:3000/api` y ver todos los endpoints documentados se siente bien, da una imagen mucho más prolija del proyecto.

6. **¿Tiempo total del día?**
   Aproximadamente una hora y media. Fue el día más corto de los tres, supongo que porque el patrón ya estaba claro y la IA no falló en nada importante.

7. **¿Qué debería mejorar este documento?**
   Podría tener un espacio para pegar el curl de ejemplo con la respuesta real que obtuviste, así queda como evidencia concreta de que el endpoint funcionó y no solo como un checkmark en una lista.
