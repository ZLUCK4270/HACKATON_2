# Feedback Día 4 — Valentino Cuenca 5 FN

**Sala:** I-SALA14
**Fecha:** 08/06/2026

---


1. **¿Comandas y Tickets fueron rápidos de construir? ¿El patrón ayudó o generó confianza excesiva?**
   Sí, la verdad fue bastante rápido. Ya con los días anteriores encima uno le agarra la lógica al patrón y fluye solo. Lo que sí me pareció importante es no relajarse tanto, porque justo cuando pensás que ya sabés lo que va a generar la IA es cuando te pasa algo por alto. A mí me pasó que asumí que el módulo iba a quedar igual que el de Mesas y casi no lo revisé, pero por suerte me di cuenta a tiempo de que había un detalle en la relación con Pedidos que no estaba bien.

2. **¿El frontend se generó bien o requirió muchas correcciones?**
   Mejor de lo que esperaba, sinceramente. Las páginas cargaron sin errores la primera vez que corrí el proyecto y se veían los datos reales del backend. Quizás el diseño no es el más bonito del mundo, pero para lo que necesitábamos cumplió bien. Lo único que ajusté fue algún tipo en TypeScript que la IA había dejado como `any` y el compilador se quejaba.

3. **¿Tuvieron problemas de CORS? ¿El SOS fue útil?**
   No tuvimos drama con eso porque lo configuramos desde el principio en el `main.ts` con `app.enableCors()`. Es una de esas cosas que si la dejás para el final te come media hora de debugging sin saber por qué el frontend no conecta con el backend. Haberlo hecho preventivo fue una buena decisión.

4. **¿La IA tomó decisiones de diseño que no les gustaron? ¿Cuáles?**
   Más o menos. El layout que generó con Tailwind está bien, no es feo, pero tampoco es que lo abrís y decís "qué bueno quedó". Todo muy cuadrado, muy genérico. El esquema de colores era azul por todos lados. Para un MVP está, pero si esto fuera un proyecto real le cambiaría bastante la cara.

5. **¿El flujo end-to-end funcionó de primera o requirió debugging?**
   Funcionó bastante bien. Hice el build final de ambos lados y compiló sin errores. Lo que sí tuve que ajustar fueron un par de tipos de TypeScript que la IA dejó sueltos, nada grave pero suficiente para que el compilador se queje si no lo corregís.

6. **¿Tiempo total?**
   Unas 2 horas aproximadamente, contando todo: Comandas, Tickets, el frontend, Swagger y dejar la documentación lista. Fue el día más corto de los cuatro, la verdad.

7. **¿Qué debería mejorar este documento?**
   Estaría bueno que tenga algún espacio para pegar capturas de pantalla o el link al repo, así queda más completo como entregable y no solo texto. También vendría bien una sección de "qué no haría de vuelta" para dejar registro de las decisiones que no salieron tan bien.
