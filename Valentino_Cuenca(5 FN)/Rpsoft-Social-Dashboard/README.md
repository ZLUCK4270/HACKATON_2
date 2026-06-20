# Dashboard Unificado de Redes Sociales — v1 YouTube

**RPSoft Bootcamp — Hackathon**  
**Director:** Wilber Peralta  
**Sala 14 — Valentino Cuenca (5 FN)**  
**Stack:** NestJS (backend) + JavaScript vanilla (frontend) + SQL.js  
**Fuente:** YouTube Data API v3 + dataset de respaldo

---

## Descripción

Sistema que se conecta a YouTube, jala métricas reales cada día, las guarda en snapshots y responde preguntas de negocio sin intervención manual. La visión es multi-red (Facebook, Instagram, TikTok); v1 empieza por YouTube.

## Preguntas que responde el dashboard

1. ¿Qué canal está creciendo más rápido?
2. ¿Cuál fue el video más exitoso de la semana / del mes?
3. ¿Qué tipo de contenido genera más interacción (Shorts vs videos largos)?
4. ¿Qué canales muestran señales de crecimiento o de estancamiento?
5. ¿Cómo evoluciona la comunidad a lo largo del tiempo?
6. ¿Qué tendencias se identifican a partir de los snapshots acumulados?

## Requisitos

- Node.js 18+
- npm
- API key de YouTube Data API v3 (opcional, funciona con respaldo)

## Instalación

```bash
cd rpsoft-dashboard
npm install
```

## Configuración

1. Copia `.env` a `.env` (o edítalo directamente):
```
YOUTUBE_API_KEY=TU_API_KEY_AQUI
BACKUP_PATH=backup-data/backup.json
PORT=3000
```

2. La API key va en `YOUR_API_KEY_HERE`. Si no se configura, el sistema usa automáticamente el dataset de respaldo.

> ⚠️ **NUNCA** commitees la API key al repo. `.env` ya está en `.gitignore`.

## Ejecución

```bash
# desarrollo con watch
npm run start:dev

# producción
npm run build
npm run start:prod
```

Abre http://localhost:3000

## Endpoints de la API

| Ruta | Descripción |
|------|-------------|
| `GET /api/channels/consolidated` | Vista consolidada de todos los canales |
| `GET /api/channels/brands` | Lista de marcas disponibles |
| `POST /api/youtube/fetch` | Jalar datos desde YouTube y guardar snapshot |
| `GET /api/youtube/status` | Estado de la fuente (API / respaldo) |
| `GET /api/snapshots?startDate=&endDate=` | Snapshots por rango de fechas |
| `GET /api/analytics/dashboard` | Dashboard completo con rankings, tendencias y timeline |
| `GET /api/analytics/top-channels?startDate=&endDate=` | Ranking de canales por tasa de crecimiento |
| `GET /api/analytics/top-videos?startDate=&endDate=` | Top videos por interacciones |
| `GET /api/analytics/content-type?startDate=&endDate=` | Comparativa Shorts vs videos largos |
| `GET /api/analytics/trend/:channelId` | Tendencia de un canal específico |

## Job automático (cron)

El sistema corre un job diario al mediodía (12:00 PM) que jala los datos de YouTube y guarda un snapshot. También puedes jalar datos manualmente desde el botón "Jalar datos ahora" en el dashboard.

## Dataset de respaldo

En `backup-data/backup.json` hay datos de 5 canales de Google con 7 días de snapshots (5-11 Jun 2026) para desarrollo y pruebas sin conectar la API real.

## Fórmulas

- **Interacciones** = likes + comentarios
- **Tasa de engagement (%)** = (likes + comentarios) / vistas × 100
- **Crecimiento neto** = subs(fin) − subs(inicio)
- **Tasa de crecimiento (%)** = ((subs_fin − subs_inicio) / subs_inicio) × 100
- **Canal que crece más rápido** = mayor **tasa** de crecimiento (%, no absoluto)
- **Video más exitoso** = mayores interacciones; desempate por engagement
- **Short** = duración ≤ 60s
- **Estancamiento** = tasa de crecimiento ≤ umbral configurable
- **Tendencia** = comparación primera mitad vs segunda mitad de la serie

## Estructura del proyecto

```
rpsoft-dashboard/
├── src/
│   ├── main.ts                    # Punto de entrada
│   ├── app.module.ts              # Módulo raíz
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── config/
│   │   └── channels.config.ts     # Canales monitoreados
│   ├── entities/
│   │   ├── channel.entity.ts
│   │   ├── channel-snapshot.entity.ts
│   │   └── video.entity.ts
│   ├── youtube/                   # Conector YouTube API
│   │   ├── youtube.module.ts
│   │   ├── youtube.controller.ts
│   │   └── youtube.service.ts
│   ├── snapshot/                  # Gestión de snapshots
│   │   ├── snapshot.module.ts
│   │   ├── snapshot.controller.ts
│   │   └── snapshot.service.ts
│   ├── analytics/                 # Motor de cálculo
│   │   ├── analytics.module.ts
│   │   ├── analytics.controller.ts
│   │   └── analytics.service.ts
│   ├── channels/                  # Gestión de canales
│   │   ├── channels.module.ts
│   │   ├── channels.controller.ts
│   │   └── channels.service.ts
│   └── cron/                      # Job diario automático
│       ├── cron.module.ts
│       ├── cron.controller.ts
│       └── cron.service.ts
├── public/                        # Frontend (vanilla JS + Chart.js)
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
├── backup-data/backup.json        # Dataset de respaldo
├── entregables/                   # Videos de demostración
│   ├── dia1/
│   ├── dia2/
│   └── dia3/
├── .env                           # Variables de entorno (no commitear)
├── predicciones.md                # Predicciones escritas del equipo
└── data/                          # Base de datos SQL.js
```

## Licencia

UNLICENSED — RPSoft Bootcamp Hackathon
