export interface DataPoint {
  date: number;
  meanDay: number;
  meanNight: number;
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