# PRE-SAID — Sistema de Restaurante
**Alumno:** Valentino Cuenca 5 FN | **Sala:** I-SALA14

---

## Estructura del proyecto

```
PRE-SAID/
├── restaurante-backend/    ← NestJS + TypeORM + SQLite
│   ├── src/
│   │   ├── platos/         ← CRUD completo
│   │   ├── mesas/          ← CRUD + cambiar estado
│   │   ├── pedidos/        ← Relaciones ManyToOne + ManyToMany
│   │   ├── comandas/       ← Vista de cocina
│   │   └── tickets/        ← Caja y facturación
│   ├── package.json
│   └── nest-cli.json
│
├── restaurante-frontend/   ← Next.js 14 + Tailwind CSS
│   └── src/app/
│       ├── /               → Dashboard
│       ├── /platos         → Gestión de platos
│       ├── /mesas          → Estado de mesas
│       ├── /pedidos        → Pedidos activos
│       ├── /comandas       → Vista de cocina
│       └── /tickets        → Caja y cobro
│
├── dia1/                   ← Documentación día 1
├── dia2/                   ← Documentación día 2
├── dia3/                   ← Documentación día 3
├── dia4/                   ← Documentación día 4
├── checklists/             ← Checklists oficiales
├── entregables/            ← Entregables
└── CHANGES.md              ← Historial de cambios
```

---

## Cómo correr el proyecto

### Backend (puerto 3000)
```bash
cd restaurante-backend
npm install
npm run start:dev
```
Swagger disponible en: http://localhost:3000/api

### Frontend (puerto 3001)
```bash
cd restaurante-frontend
npm install
npm run dev -- -p 3001
```
App disponible en: http://localhost:3001

---

## Módulos del backend

| Módulo    | Endpoints principales                              |
|-----------|----------------------------------------------------|
| Platos    | GET/POST/PATCH/DELETE `/platos`                    |
| Mesas     | GET/POST `/mesas`, PATCH `/mesas/:id/estado`       |
| Pedidos   | GET/POST `/pedidos`, PATCH `/pedidos/:id/estado`   |
| Comandas  | GET/POST `/comandas`, PATCH `/comandas/:id/estado` |
| Tickets   | GET/POST `/tickets`, PATCH `/tickets/:id/pagar`    |

---

## Días del curso

| Día | Tema | Estado |
|-----|------|--------|
| 1   | Setup + Módulo Platos | ✅ |
| 2   | Code Review + Módulo Mesas | ✅ |
| 3   | Relaciones + Módulo Pedidos + Swagger | ✅ |
| 4   | Comandas + Tickets + Frontend Next.js | ✅ |
