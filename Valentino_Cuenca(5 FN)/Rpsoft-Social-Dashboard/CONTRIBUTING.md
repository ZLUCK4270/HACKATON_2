# 🤝 Guía de Contribución

## Antes de empezar

1. Lee [DEVELOPMENT.md](./DEVELOPMENT.md)
2. Configura tu ambiente local
3. Crea una rama para tu feature/fix

## Proceso de desarrollo

### 1. Crear rama
```bash
git checkout -b feature/descripcion-corta
# o
git checkout -b fix/descripcion-del-bug
```

### 2. Hacer cambios
- Escribe código limpio y legible
- Sigue las convenciones del proyecto
- Agrega tests si corresponde

### 3. Validar

```bash
# Linting
npm run lint

# Formateo
npm run format

# Tests
npm run test

# Build
npm run build
```

### 4. Commit

```bash
git add .
git commit -m "tipo: descripción"

# Tipos válidos:
# feat:   Nueva feature
# fix:    Bug fix
# docs:   Cambios en documentación
# style:  Formatting, semicolons, etc
# refactor: Refactorización sin cambios funcionales
# perf:   Mejoras de performance
# test:   Tests
# chore:  Cambios en build/deps
```

### 5. Push y PR

```bash
git push origin feature/descripcion-corta
```

Luego abre un PR en GitHub con descripción clara.

## Estándares de código

### TypeScript
- Usar tipos explícitos
- No usar `any`
- Usar interfaces para shapes complejos

### NestJS
- Inyección de dependencias siempre
- Controllers delgados, lógica en Services
- Separar responsabilidades

### Testing
- Mínimo 80% coverage
- Tests unitarios para servicios
- Tests de integración para controllers

## Review de código

Los PRs requieren:
- Mínimo 1 aprobación
- Tests pasando
- Linting pasando
- Build exitoso

## Área de mejora

Áreas que necesitan contribuciones:
- [ ] Tests para todos los módulos
- [ ] Documentación de API con Swagger
- [ ] Caché distribuido
- [ ] Monitoreo y observabilidad
- [ ] Paginación en endpoints
- [ ] Rate limiting
- [ ] Autenticación

## Preguntas?

Contacta al equipo en los issues del proyecto.
