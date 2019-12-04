export interface Stat {
  x: number;
  y: number;
}

export interface StatWithDummyPoint {
  x: number;
  y: number | null;
}

interface FS<WithDummy = false> {
  itotal: WithDummy extends true ? StatWithDummyPoint[] : Stat[];
  ifree: WithDummy extends true ? StatWithDummyPoint[] : Stat[];
  total: WithDummy extends true ? StatWithDummyPoint[] : Stat[];
  free: WithDummy extends true ? StatWithDummyPoint[] : Stat[];
  path: string;
}

export interface Disk<WithDummy = false> {
  dm: number;
  children: number;
  mounted: number;
  childof: number;
  isswap: number;
  write_bytes?: WithDummy extends true ? StatWithDummyPoint[] : Stat[];
  writes?: WithDummy extends true ? StatWithDummyPoint[] : Stat[];
  reads?: WithDummy extends true ? StatWithDummyPoint[] : Stat[];
  read_bytes?: WithDummy extends true ? StatWithDummyPoint[] : Stat[];
  fs: FS<WithDummy>;
}
/*
  each key will be the name of the disk

  So if I have 1 ext disk and 1 swap, the keys might be:

  {
    /dev/sdb: Disk,
    /dev/sda: Disk
  }

*/
export interface LongviewDisk<WithDummy = false> {
  Disk: Record<string, Disk<WithDummy>>;
}

interface RealMemory<WithDummy = false> {
  free: WithDummy extends true ? StatWithDummyPoint[] : Stat[];
  buffers: WithDummy extends true ? StatWithDummyPoint[] : Stat[];
  used: WithDummy extends true ? StatWithDummyPoint[] : Stat[];
  cache: WithDummy extends true ? StatWithDummyPoint[] : Stat[];
}

interface SwapMemory<WithDummy = false> {
  free: WithDummy extends true ? StatWithDummyPoint[] : Stat[];
  used: WithDummy extends true ? StatWithDummyPoint[] : Stat[];
}

export interface LongviewMemory<WithDummy = false> {
  Memory: {
    real: RealMemory<WithDummy>;
    swap: SwapMemory<WithDummy>;
  };
}

export interface CPU<WithDummy = false> {
  user: WithDummy extends true ? StatWithDummyPoint[] : Stat[];
  wait: WithDummy extends true ? StatWithDummyPoint[] : Stat[];
  system: WithDummy extends true ? StatWithDummyPoint[] : Stat[];
}

/*
  each key will be cpu${number}

  So if I have 2 CPUs, the keys will be:

  {
    cpu0: CPU,
    cpu1: CPU
  }

*/
export interface LongviewCPU<WithDummy = false> {
  CPU: Record<string, CPU<WithDummy>>;
}

export interface LongviewLoad<WithDummy = false> {
  Load: WithDummy extends true ? StatWithDummyPoint[] : Stat[];
}

export interface InboundOutboundNetwork<WithDummy = false> {
  rx_bytes: WithDummy extends true ? StatWithDummyPoint[] : Stat[];
  tx_bytes: WithDummy extends true ? StatWithDummyPoint[] : Stat[];
}

export interface LongviewNetwork<WithDummy = false> {
  Network: {
    mac_addr: string;
    Interface: Record<string, InboundOutboundNetwork<WithDummy>>;
  };
}

export interface LastUpdated {
  updated: number;
}

export interface Uptime {
  uptime: number;
}

export interface LongviewPackage {
  name: string;
  current: string;
  new: string;
  held: number;
}

export interface LongviewPackages {
  Packages: LongviewPackage[];
}

export interface LongviewService {
  user: string;
  ip: string;
  type: string;
  port: number;
  name: string;
}

export interface LongviewPort {
  count: number;
  user: string;
  name: string;
}
export interface LongviewPortsResponse {
  Ports?: {
    listening: LongviewService[];
    active: LongviewPort[];
  };
}

export interface LongviewSystemInfo {
  SysInfo: {
    arch: string;
    client: string;
    type: string;
    os: {
      distversion: string;
      dist: string;
    };
    cpu: {
      cores: number;
      type: string;
    };
    hostname: string;
    kernel: string;
  };
}
// Resulting shape of calling `/fetch` with an api_action of `getValues` or
// `getLatestValues` (and asking for the "Processes.*" key).
export interface LongviewProcesses<S = Stat> {
  Processes?: Record<string, Process<S>>;
}

export type Process<WithDummy = false> = { longname: string } & Record<
  string,
  ProcessStats<WithDummy>
>;

export interface ProcessStats<WithDummy = false> {
  count?: WithDummy extends true ? StatWithDummyPoint[] : Stat[];
  cpu?: WithDummy extends true ? StatWithDummyPoint[] : Stat[];
  ioreadkbytes?: WithDummy extends true ? StatWithDummyPoint[] : Stat[];
  iowritekbytes?: WithDummy extends true ? StatWithDummyPoint[] : Stat[];
  mem?: WithDummy extends true ? StatWithDummyPoint[] : Stat[];
}

// Resulting shape of calling `/fetch` with an api_action of `getTopProcesses`.
export interface LongviewTopProcesses {
  Processes?: Record<string, TopProcess>;
}

export type TopProcess = Record<string, TopProcessStat>;

export interface TopProcessStat {
  count: number;
  cpu: number;
  mem: number;
  entries: number;
}
