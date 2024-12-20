interface TimeData {
  timestamp: number;
}

interface CPUTimeData extends TimeData {
  'CPU %': number;
}

interface DiskIOTimeData extends TimeData {
  'I/O Rate': number;
  'Swap Rate': number;
}

interface NetworkTimeData extends TimeData {
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
