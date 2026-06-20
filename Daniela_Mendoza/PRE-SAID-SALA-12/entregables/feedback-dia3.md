1. ¿Las relaciones (ManyToOne, ManyToMany) fueron difíciles para la IA o las hizo bien?
fueron la parte más compleja del día. La IA ayudó a generar gran parte del código, pero fue necesario revisar las entidades, los DTOs y los servicios para asegurar que las relaciones entre pedidos, mesas y platos funcionaran correctamente. 
2. ¿La IA rompió Platos o Mesas al crear Pedidos?
No la rompio ya que el prompt que nos dieron esta bien estructurado. 
3. ¿Los comandos curl para testing fueron útiles?
fueron útiles porque permitieron probar rápidamente los endpoints desde la terminal y verificar que POST /pedidos y GET /pedidos funcionaran correctamente sin depender únicamente de Swagger. 
4. ¿La regla de los 3 intentos es clara? ¿La aplicaron?
Si fue clara, si la llegamos a aplicar. 
5. ¿Swagger fue fácil de configurar?
Swagger fue relativamente fácil de configurar. Una vez agregada la configuración en main.ts, permitió visualizar todos los módulos y probar los endpoints de manera rápida. 
6. ¿Tiempo total del día?
En total nos tomó casi 6 horas. 
7. ¿Qué debería mejorar este documento?
Incluyendo más ejemplos de relaciones ManyToOne y ManyToMany, ejemplos completos de curl para pruebas y una guía más detallada para la configuración de Swagger y la validación de DTOs. 
