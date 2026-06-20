export interface VideoMetricsInput {
  views: number;
  likes: number;
  comments: number;
}

export interface ChannelSnapshotInput {
  subscriberCount: number;
}

export class CalculadoraMetricas {
  /**
   * Calcula el engagement de un video con la fórmula:
   * ((likes + comments) / views) * 100
   * Si las vistas son 0, retorna null.
   */
  static calcularEngagement(video: VideoMetricsInput): number | null {
    if (video.views <= 0) {
      return null;
    }
    const engagement = ((video.likes + video.comments) / video.views) * 100;
    return parseFloat(engagement.toFixed(2));
  }

  /**
   * Calcula el crecimiento entre dos snapshots (anterior y actual) de un canal:
   * - neto: suscriptores actuales - anteriores
   * - tasa: ((neto) / anteriores) * 100
   * Si los suscriptores anteriores son 0, la tasa es 0.
   */
  static calcularCrecimiento(
    anterior: ChannelSnapshotInput,
    actual: ChannelSnapshotInput,
  ) {
    const neto = actual.subscriberCount - anterior.subscriberCount;
    
    let tasa = 0;
    if (anterior.subscriberCount > 0) {
      tasa = (neto / anterior.subscriberCount) * 100;
    }
    
    return {
      neto,
      tasa: parseFloat(tasa.toFixed(2)),
    };
  }
}
