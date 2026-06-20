#!/bin/bash

echo "🔍 Verificando estructura del proyecto..."

# Verificar archivos críticos
files=(
  "src/common/dto/date-range.query.dto.ts"
  "src/common/filters/all-exceptions.filter.ts"
  "src/common/interceptors/transform.interceptor.ts"
  "src/common/health/health.module.ts"
  "src/config/environment.validation.ts"
  ".env.example"
  "DEVELOPMENT.md"
  "CONTRIBUTING.md"
  ".vscode/settings.json"
  ".vscode/launch.json"
)

echo "✅ Archivos verificados:"
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file"
  else
    echo "  ✗ FALTA: $file"
  fi
done

echo ""
echo "📦 Instalando dependencias..."
npm install

echo ""
echo "🏗️  Build del proyecto..."
npm run build

echo ""
echo "✅ Verificación completada!"
echo ""
echo "Próximos pasos:"
echo "  1. npm run start:dev  — Iniciar en desarrollo"
echo "  2. curl http://localhost:3000/api/health  — Verificar health check"
echo "  3. Lee DEVELOPMENT.md para más información"
