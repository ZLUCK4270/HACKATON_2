# Feedback Día 3 — Jonel — I-SALA3
## PRE-SAID — Desarrollo Moderno con IA y CLI

---

**1. ¿Las relaciones (ManyToOne, ManyToMany) fueron difíciles para la IA o las hizo bien?**

Las relaciones fueron implementadas correctamente. El uso de `@ManyToOne` para Mesa y `@ManyToMany` para Platos con `@JoinTable` fue preciso. La decisión de no modificar las entidades existentes (Plato y Mesa) fue acertada — mantiene la independencia de los módulos y evita efectos secundarios.

**2. ¿La IA rompió Platos o Mesas al crear Pedidos?**

No. Los módulos Platos y Mesas continuaron funcionando sin ninguna modificación. El diseño de importar los repositorios directamente con `TypeOrmModule.forFeature([Pedido, Plato, Mesa])` en PedidosModule evitó la necesidad de modificar los módulos existentes o crear dependencias circulares.

**3. ¿Los comandos curl para testing fueron útiles?**

Sí, especialmente el de probar el error 400 con una mesa inexistente (`mesaId: 9999`). Esa prueba confirmó que el manejo de errores estaba correcto y que el servidor no se caía con un 500 sino respondía limpiamente con 400 y un mensaje descriptivo.

**4. ¿La regla de los 3 intentos es clara? ¿La aplicaron?**

La regla es clara y tiene mucho sentido: si la IA falla 3 veces seguidas, está en "modo túnel" (efecto Einstellung) y hay que cambiar el enfoque. No fue necesario aplicarla hoy porque el módulo Pedidos funcionó desde el primer intento. Sin embargo, la regla se habría aplicado si hubiera habido problemas con las relaciones o los errores 400.

**5. ¿Swagger fue fácil de configurar?**

Sí. Solo requirió instalar `@nestjs/swagger@7` (versión compatible con NestJS 10) y configurar 5 líneas en `main.ts`. La documentación automática en `http://localhost:3000/api` muestra todos los endpoints de los 3 módulos sin ninguna anotación adicional en los controladores.

**6. ¿Tiempo total del día?**

Aproximadamente 2.5 horas incluyendo: revisión del código del Día 2, creación del módulo Pedidos, validación de errores 400, configuración de Swagger, documentación y entregables.

**7. ¿Qué debería mejorar este documento?**

Sería útil incluir un video corto (no solo el Loom) mostrando específicamente el flujo completo de un pedido: crear mesa → crear platos → crear pedido → cambiar estado del pedido. También sería valioso un diagrama de las relaciones entre entidades para que el equipo visualice la arquitectura antes de empezar a codear.
