# Feedback Día 5 — Valentino Cuenca 5 FN

**Sala:** I-SALAX
**Fecha:** 12/06/2026

---

## 1. ¿La migración de SQLite a PostgreSQL fue fácil? ¿La IA la hizo bien?

Sí, fue bastante directa. La IA entendió bien el concepto de tener `DATABASE_URL` para producción y SQLite como fallback local. El cambio fue solo en `app.module.ts` usando un condicional en tiempo de compilación. El tema de instalar `pg` y `@nestjs/config` también lo manejó sin problemas. Lo único que no anticipó —y que después nos costó un par de commits— fue que PostgreSQL maneja los `decimal` como strings, cosa que SQLite no hace. Eso rompió el frontend silenciosamente hasta que lo rastreamos en la consola del navegador.

## 2. ¿Render fue fácil de configurar? ¿Errores?

La parte más tediosa fue conectar el repositorio porque el proyecto es privado y Render no podía verlo sin permisos explícitos de GitHub. Perdimos un rato ahí hasta que hicimos deploy manual con el último commit. Después, el primer build falló porque puse `presaid-restaurante-backend` como Root Directory en lugar de `PRE-SAID/restaurante-backend`. Una vez corregido eso y configurada la variable `DATABASE_URL`, el build pasó sin problemas.

El tier gratis es lento —tarda como 30 segundos en responder la primera request después de un periodo de inactividad— pero para un MVP está bien.

## 3. ¿Vercel fue fácil de configurar? ¿Errores?

Vercel fue más sencillo que Render. Importás el repo, seleccionás `PRE-SAID/restaurante-frontend` como root directory, agregás `NEXT_PUBLIC_API_URL` en environment variables, y ya. En un par de minutos el frontend ya estaba andando. El build de Next.js se encargó solo, no hubo que tocar nada raro.

## 4. ¿CORS fue un problema? ¿Cómo lo resolvieron?

Para nada, y eso que backend y frontend están en dominios diferentes (Render y Vercel). Resulta que desde el Día 4 el backend ya tenía `app.enableCors()` sin restricciones de origen, así que las peticiones del frontend pasaron sin problema. Si hubiera tenido CORS restrictivo, el error más común es que el navegador bloquea las requests y no se ve en el backend ni en el frontend server — solo en la consola del navegador. Eso hubiera sido difícil de diagnosticar sin experiencia.

## 5. ¿Variables de entorno: la IA las manejó bien o puso credenciales en el código?

La IA las manejó bien. Creó `.env.example` con valores placeholder y puso las variables reales solo en `.env` (que está en `.gitignore`). En los prompts dejé claro que no quería credenciales hardcodeadas y lo respetó. En Render configuramos `DATABASE_URL` manualmente desde el dashboard, no en el código.

## 6. ¿Qué fue lo más difícil?

Sin duda los errores que aparecen solo en producción. En local todo funcionaba perfecto con SQLite, pero al pasar a PostgreSQL:
- `decimal` retorna string (rompe el frontend)
- Las FK duplicadas por `@Column` + `@ManyToOne` (SQLite lo tolera, PostgreSQL no)

Son problemas que no se ven hasta que deployás. Esa fue la principal enseñanza del día: código que funciona en localhost no necesariamente funciona en producción.

## 7. ¿Tiempo total?

Aproximadamente 2 horas y media, contando:
- Setup de PostgreSQL y variables de entorno (~20 min)
- Deploy a Render y Vercel (~40 min, incluyendo el problema del root directory y permisos)
- Debug de errores en producción (~1 hora entre decimal transformer y FK)
- Documentación y cierre (~20 min)

## 8. ¿Qué debería mejorar este documento?

Agregaría una sección de "Problemas conocidos de PostgreSQL vs SQLite" para que la gente sepa anticipadamente que:
- Los `decimal` se serializan como strings
- Las FK requieren `@JoinColumn` en lugar de `@Column` duplicado
- `synchronize: true` funciona pero no es ideal

También sugeriría incluir los comandos exactos de `curl` para crear datos de prueba en producción, porque si no la base de datos arranca vacía y el frontend no muestra nada.
