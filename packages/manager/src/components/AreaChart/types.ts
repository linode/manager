interface TimeData {
  timestamp: number;
}

export interface CPUTimeData extends TimeData {
  'CPU %': number;
}

export interface DiskIOTimeData extends TimeData {
  'I/O Rate': number;
  'Swap Rate': number;
}

export interface NetworkTimeData extends TimeData {
  'Private In': number;
  'Private Out': number;
  'Public In': number;
  'Public Out': number;
}

export interface LinodeNetworkTimeData extends TimeData {
  'Public Outbound Traffic': number;
}

export interface NodeBalancerConnectionsTimeData extends TimeData {
  Connections: number;
}

export type Point = [number, number];
