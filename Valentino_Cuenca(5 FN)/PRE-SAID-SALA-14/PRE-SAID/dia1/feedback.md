# Feedback Día 1 — Valentino Cuenca 5 FN

**Sala:** I-SALA14
**Fecha:** 01/06/2026

---

## 1. ¿Gemini CLI fue fácil de instalar? ¿Problemas?

Más o menos. El comando `npm install -g @google/gemini-cli` en sí no tiene ningún misterio, pero después cuando intenté correrlo desde PowerShell me decía que el comando no existía. Tardé un rato en darme cuenta de que era un problema del PATH, que la carpeta global de npm no estaba incluida. Una vez que la agregué manualmente a la sesión funcionó. No es algo complicado pero si no sabés lo que estás mirando te puede comer 20 minutos fácil.

## 2. ¿Cursor fue fácil de configurar?

Sí, lo de instalarlo fue rápido. Donde me trabé un poco fue en el modo Agent, porque no se activa solo, hay que cambiarlo a mano desde la configuración. No está en un lugar muy obvio la primera vez que lo buscás. Pero una vez que lo encontré y lo activé anduvo bien.

## 3. ¿El prompt para Platos fue claro? ¿Qué cambiarían?

Sí, la estructura del prompt ayudó bastante. Que esté dividido en QUÉ HACER, LINEAMIENTOS y QUÉ NO HACER le da claridad y la IA siguió bien las instrucciones. No cambiaría nada del prompt en sí, funcionó como esperaba.

## 4. ¿Las predicciones ayudaron a evaluar el output?

Sí, y bastante más de lo que pensé. Antes de usarlas yo simplemente miraba el código y decía "parece que está bien". Con las predicciones ya tenía en la cabeza qué estructura esperar, entonces cuando la IA generaba algo distinto lo notaba enseguida en lugar de aceptarlo sin pensar.

## 5. ¿Qué fue lo más difícil? ¿Tiempo total?

Lo del PATH fue lo que más tiempo me llevó al principio. También me pasó que Gemini CLI se abrió en `system32` en lugar de abrirse en la carpeta del repo, así que los primeros comandos los corrí en el lugar equivocado. Cuando me di cuenta tuve que volver a empezar esa parte. En total me llevó entre una hora y media y dos horas, contando todo.

## 6. ¿Qué debería explicar mejor este documento?

Definitivamente agregar una nota sobre el PATH de npm en Windows, porque es algo que no viene explicado y te frena desde el primer paso. Y también aclarar que hay que asegurarse de estar parado en la carpeta del repo antes de abrir Gemini CLI, porque si no te genera todo en el lugar equivocado.
