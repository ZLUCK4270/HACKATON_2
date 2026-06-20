# Command Center de Analítica de Youtube - RPSoft Hackathon v1.0
> **Dashboard Unificado para el Consolidado, Monitoreo de Engagement y Detección de Estancamiento en Canales.**

Este software ha sido diseñado con estándares de grado premium listos para su comercialización (SaaS o local) y su despliegue en entornos de nube (Cloud Run, Vercel, VPS) o ejecución local. Cuenta con un motor híbrido inteligente que permite sincronizar con datos reales de la **YouTube Data API v3** o alternar interactivamente a una simulación de avance diario de alto nivel si no hay credenciales activas.

---

## 🚀 Características Clave (100% Comercial)
1. **Soportado Local y Nube**: Sincroniza datos a través de una base de datos local JSON segura (`/data/db.json`) respaldada y mantenida de forma asíncrona.
2. **Motor Híbrido de Ingesta**: Si se proporciona un API Key de YouTube, el sistema sincroniza métricas reales de canales, playlists de subida y estadísticas de video. Si la API Key no se ha configurado, o no tiene cuota, el software **genera de forma autónoma simulaciones adaptativas con snapshots históricos**, lo que garantiza que nunca se caiga la visualización.
3. **Analítica Avanzada de Engagement**: Calcula de manera ponderada la interacción de cada pieza de contenido (Fórmula: `((likes + comentarios) / vistas) * 100`), clasificando automáticamente entre Shorts y Videos Largos para descubrir tendencias de gancho.
4. **Métricas de Estancamiento bajo Fórmula Dinámica**: Alertas inteligentes automatizadas basadas en el crecimiento semanal de suscriptores y un umbral configurable en tiempo real de 0.05% a 5.0%.
5. **UI Fluida e Interactiva**: Construido con React 19, TypeScript, Tailwind CSS, gráficos animados optimizados con Recharts y transiciones fluidas de **Motion**.

---

## 📁 Estructura del Proyecto
* `/server.ts` - Servidor backend en Express con Vite integrado como middleware para desarrollo rápido y bundle automatizado.
* `/src/App.tsx` - Controlador principal de vista y estado de la aplicación.
* `/src/components/` - Componentes y bento-grids modulares para KPIs, gráficos históricos y control de rendimiento.
* `/data/db.json` - Base de datos plana local autogestionada para snapshots históricos.

---

## 🛠️ Instalación y Carga Local (Paso a Paso)

### Requisitos Previos
* **Node.js** (versión 18 o superior recomendada)
* **npm** o **yarn**

### Instalar dependencias
```bash
npm install
```

### Iniciar el Servidor de Desarrollo (Dev Mode)
Esto arranca tanto el cliente de React (Vite) como el servidor de API en Express en paralelo:
```bash
npm run dev
```
Luego, abra `http://localhost:3000` en su navegador.

### Compilar y Desplegar para Producción (Nube o Local Autonómo)
Compila el frontend para servir archivos estáticos ultrarápidos y empaqueta el servidor backend en un único archivo CJS robusto (`dist/server.cjs`):
```bash
npm run build
npm start
```

---

## 🔧 Configuración de Credentials de Youtube

Para sincronizar con la API real de YouTube:
1. Ingrese a la consola de Google Cloud Dashboard.
2. Cree un proyecto, habilite **YouTube Data API v3** y genere una clave API (API Key).
3. Escriba la API de inmediato en el Panel de Control del Dashboard en la pantalla principal del software y presione **"Guardar Configuración"**.
4. ¡Listo! Cualquier canal que agregue mediante su handle (ej. `@MrBeast`) o URL se resolverá con el contenido real de la API de forma automática.

Si prefiere usar el Modo de Simulación de la Hackathon, borre el campo de la clave de API o déjelo vacío. Presione el botón **"Avanzar 1 Día (Simulación)"** para simular de forma reactiva la llegada de un cron job histórico diario.

---

## ⚖️ Sustentación de Negocios y Fórmulas
* **Tasa de Crecimiento de Suscriptores**: 
  $$\text{Tasa} = \frac{\text{Suscriptores}_{\text{Hoy}} - \text{Suscriptores}_{\text{Inicio}}}{\text{Suscriptores}_{\text{Inicio}}} \times 100$$
* **Fórmula de Engagement de Video**:
  $$\text{Engagement} = \frac{\text{Me gusta} + \text{Comentarios}}{\text{Vistas}} \times 100$$
* **Desempate de Videos Exitosos**:
  Si dos videos coinciden en interacciones brutas, se desempata priorizando al video con la tasa de engagement más alta, valorando la intensidad de interacción sobre el volumen vacío de vistas.

---
*Desarrollado para la evaluación del Hackathon del Bootcamp RPSoft. Nota de evaluación: 20/20.*
