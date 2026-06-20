PREDICCIÓN 3

Pedidos necesita relaciones con Platos y Mesas. ¿La IA usará @ManyToOne para Mesa y @ManyToMany para Platos? ¿O inventará otra estructura? ¿Modificará las entidades de Platos y Mesas para agregar el lado inverso de la relación?
Tu predicción: SI por que en el prompt asi lo dice, no va inventar estructura , solo modificara si es necesario pero las especificaciones dice que no se haga 


PREDICCIÓN 4

La IA necesita crear una tabla intermedia para ManyToMany (pedido_platos). ¿La creará automáticamente con @JoinTable o intentará crear una entidad separada? ¿Modificará plato.entity.ts para agregar el @ManyToMany inverso?
Tu predicción: creara una tabla intermediaria ya que en el prompt se le exige ello, no una entidad separada y no modificara plato.etity.ts.

