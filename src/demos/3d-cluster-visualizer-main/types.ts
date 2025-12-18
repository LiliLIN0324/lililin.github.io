export interface DataPoint {
  date: number;
  meanDay: number;
  meanNight: number;
  
  // 可选字段
  P10Day?: number;
  P25Day?: number;
  P75Day?: number;
  P90Day?: number;

  P10Night?: number;
  P25Night?: number;
  P75Night?: number;
  P90Night?: number;
}

export interface Cluster {
  id: number;
  name: string;
  data: DataPoint[];
  color: string;
}

export interface ViewState {
  k: number;
  selectedClusterId: number | null;
  selectedPointIndex: number | null;
}