import { CalculadoraMetricas } from './calculadora-metricas';

describe('CalculadoraMetricas', () => {
  describe('calcularEngagement', () => {
    it('debe retornar null si las vistas son 0 o menores', () => {
      expect(CalculadoraMetricas.calcularEngagement({ views: 0, likes: 10, comments: 5 })).toBeNull();
      expect(CalculadoraMetricas.calcularEngagement({ views: -5, likes: 10, comments: 5 })).toBeNull();
    });

    it('debe calcular correctamente el engagement y redondear a 2 decimales', () => {
      // 100 views, 10 likes, 5 comments -> (15 / 100) * 100 = 15.00
      expect(CalculadoraMetricas.calcularEngagement({ views: 100, likes: 10, comments: 5 })).toBe(15);
      
      // 3 views, 1 like, 0 comments -> (1 / 3) * 100 = 33.333... -> 33.33
      expect(CalculadoraMetricas.calcularEngagement({ views: 3, likes: 1, comments: 0 })).toBe(33.33);
    });
  });

  describe('calcularCrecimiento', () => {
    it('debe calcular crecimiento neto positivo y tasa correctamente', () => {
      const anterior = { subscriberCount: 1000 };
      const actual = { subscriberCount: 1500 };
      
      const res = CalculadoraMetricas.calcularCrecimiento(anterior, actual);
      expect(res.neto).toBe(500);
      expect(res.tasa).toBe(50);
    });

    it('debe calcular crecimiento neto negativo y tasa correctamente', () => {
      const anterior = { subscriberCount: 1000 };
      const actual = { subscriberCount: 800 };
      
      const res = CalculadoraMetricas.calcularCrecimiento(anterior, actual);
      expect(res.neto).toBe(-200);
      expect(res.tasa).toBe(-20);
    });

    it('debe manejar cuando los suscriptores anteriores son 0', () => {
      const anterior = { subscriberCount: 0 };
      const actual = { subscriberCount: 50 };
      
      const res = CalculadoraMetricas.calcularCrecimiento(anterior, actual);
      expect(res.neto).toBe(50);
      expect(res.tasa).toBe(0);
    });
  });
});
