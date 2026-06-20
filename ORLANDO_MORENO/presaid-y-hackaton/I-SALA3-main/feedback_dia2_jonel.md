# Feedback Día 2 - PRE-SAID

**1. ¿Los videos de code review les sirvieron para saber qué buscar?**
Sí, abrieron los ojos sobre cómo la IA puede exponer llaves o crear cosas sin control si uno no presta atención a cada línea.

**2. ¿El prompt para Mesas fue claro? ¿Qué cambiarían?**
Fue bastante claro al poner restricciones negativas (Qué NO hacer). Podría ser aún mejor si fuéramos más explícitos con respecto a cómo manejar errores específicos o excepciones.

**3. ¿El flujo de Git branches fue fácil o confuso?**
Al principio el cambio de ramas requiere algo de costumbre, pero la ventaja de poder aislar el código en `feature/mesas` antes de integrarlo da mucha seguridad.

**4. ¿Cuántos errores encontraron en el code review? ¿Los esperaban?**
Encontramos un par de detalles en cuanto al manejo de excepciones con TypeORM (errores de duplicidad). Lo esperábamos porque la IA a veces asume el comportamiento feliz (happy path) sin validar excepciones correctamente.

**5. ¿Tiempo total del día?**
Aproximadamente 1.5 a 2 horas entre revisar los videos, aplicar la IA y hacer el code review manual.

**6. ¿Qué debería mejorar este documento?**
Las pautas de predicción podrían ser más extensas o incluir ejemplos más técnicos.
