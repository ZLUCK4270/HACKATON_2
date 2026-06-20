# Feedback Día 5 — Jonel — I-SALA3
## PRE-SAID — Desarrollo Moderno con IA y CLI

---

**1. ¿La migración de SQLite a PostgreSQL fue fácil? ¿La IA la hizo bien?**

Sí, la migración consistió únicamente en instalar el driver `pg`, agregar `@nestjs/config` para usar variables de entorno y cambiar la configuración en `app.module.ts`. La IA lo hizo correctamente, usando un fallback a SQLite si no encuentra la variable `DATABASE_URL`, lo que permite que el desarrollo local siga funcionando sin problemas mientras producción usa PostgreSQL.

**2. ¿Render fue fácil de configurar? ¿Errores?**

*(Llena tu respuesta aquí después de usar Render)*

**3. ¿Vercel fue fácil de configurar? ¿Errores?**

*(Llena tu respuesta aquí después de usar Vercel)*

**4. ¿CORS fue un problema? ¿Cómo lo resolvieron?**

El CORS ya estaba configurado con `app.enableCors()` desde el Día 4. Como usamos la configuración permisiva global, el frontend en Vercel pudo conectarse sin problema al backend en Render sin que diera el típico error de "No Access-Control-Allow-Origin".

**5. ¿Variables de entorno: la IA las manejó bien o puso credenciales en el código?**

La IA lo manejó de manera segura: generó archivos `.env.example` tanto para el backend como para el frontend y parametrizó las conexiones (`process.env.DATABASE_URL` y `process.env.NEXT_PUBLIC_API_URL`). No hubo ninguna credencial harcodeada en el código fuente de los commits.

**6. ¿Tiempo total?**

Aproximadamente 45 minutos (incluyendo configuraciones locales, creación de repos, y la espera de los builds en Render y Vercel).

**7. ¿Qué debería mejorar este documento?**

Quizás una sección dedicada a cómo hacer logs o debugging en producción cuando las variables de entorno fallan, ya que es el problema más común en los deployments iniciales.
