export interface Stat {
  x: number;
  y: number;
}

/*
  interfaced used solely for the purpose
  of interacting with the Longview API _start_ and _end_
  query params. Because the API doesn't return a dataset for
  the requested start time if no data existed at that time,
  the client will be responsible for prepending the dataset
  with a dummy data point at the start time requested

  As an added bounus, each interface below will have a 'yAsNull'
  type argument so the developer can choose to override the Stat types
 */
export interface StatWithDummyPoint {
  x: number;
  y: null | number;
}

interface FS<WithDummy extends '' | 'yAsNull' = ''> {
  free: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  ifree: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  itotal: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  path: string;
  total: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
}

export interface Disk<WithDummy extends '' | 'yAsNull' = ''> {
  childof: number;
  children: number;
  dm: number;
  fs?: FS<WithDummy>;
  isswap: number;
  mounted: number;
  read_bytes?: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  reads?: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  write_bytes?: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  writes?: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
}
/*
  each key will be the name of the disk

  So if I have 1 ext disk and 1 swap, the keys might be:

  {
    /dev/sdb: Disk,
    /dev/sda: Disk
  }

*/
export interface LongviewDisk<WithDummy extends '' | 'yAsNull' = ''> {
  Disk: Record<string, Disk<WithDummy>>;
}

interface RealMemory<WithDummy extends '' | 'yAsNull' = ''> {
  buffers: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  cache: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  free: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  used: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
}

interface SwapMemory<WithDummy extends '' | 'yAsNull' = ''> {
  free: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  used: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
}

export interface LongviewMemory<WithDummy extends '' | 'yAsNull' = ''> {
  Memory: {
    real: RealMemory<WithDummy>;
    swap: SwapMemory<WithDummy>;
  };
}

export interface CPU<WithDummy extends '' | 'yAsNull' = ''> {
  system: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  user: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  wait: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
}

/*
  each key will be cpu${number}

  So if I have 2 CPUs, the keys will be:

  {
    cpu0: CPU,
    cpu1: CPU
  }

*/
export interface LongviewCPU<WithDummy extends '' | 'yAsNull' = ''> {
  CPU: Record<string, CPU<WithDummy>>;
}

export interface LongviewLoad<WithDummy extends '' | 'yAsNull' = ''> {
  Load: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
}

export interface InboundOutboundNetwork<WithDummy extends '' | 'yAsNull' = ''> {
  rx_bytes: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  tx_bytes: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
}

export type LongviewNetworkInterface<WithDummy extends '' | 'yAsNull' = ''> =
  Record<string, InboundOutboundNetwork<WithDummy>>;
export interface LongviewNetwork<WithDummy extends '' | 'yAsNull' = ''> {
  Network: {
    Interface: LongviewNetworkInterface<WithDummy>;
    mac_addr: string;
  };
}

export interface LastUpdated {
  updated: number;
}

export interface Uptime {
  Uptime: number;
}

export interface LongviewPackage {
  current: string;
  held: number;
  name: string;
  new: string;
}

export interface LongviewPackages {
  Packages: LongviewPackage[];
}

export interface LongviewService {
  ip: string;
  name: string;
  port: number;
  type: string;
  user: string;
}

export interface LongviewPort {
  count: number;
  name: string;
  user: string;
}
export interface LongviewPortsResponse {
  Ports?: {
    active: LongviewPort[];
    listening: LongviewService[];
  };
}

export interface LongviewSystemInfo {
  SysInfo: {
    arch: string;
    client: string;
    cpu: {
      cores: number;
      type: string;
    };
    hostname: string;
    kernel: string;
    os: {
      dist: string;
      distversion: string;
    };
    type: string;
  };
}
// Resulting shape of calling `/fetch` with an api_action of `getValues` or
// `getLatestValues` (and asking for the "Processes.*" key).
export interface LongviewProcesses<WithDummy extends '' | 'yAsNull' = ''> {
  Processes?: Record<string, Process<WithDummy>>;
}

export interface Process<WithDummy extends '' | 'yAsNull' = ''> {
  count?: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  cpu?: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  ioreadkbytes?: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  iowritekbytes?: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  longname: string;
  mem?: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
}

export interface ProcessStats<WithDummy extends '' | 'yAsNull' = ''> {
  count?: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  cpu?: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  ioreadkbytes?: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  iowritekbytes?: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  mem?: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
}

// Resulting shape of calling `/fetch` with an api_action of `getTopProcesses`.
export interface LongviewTopProcesses {
  Processes?: Record<string, TopProcess>;
}

export type TopProcess = Record<string, TopProcessStat>;

export interface TopProcessStat {
  count: number;
  cpu: number;
  entries: number;
  mem: number;
}

export type AllData = LongviewCPU &
  LongviewDisk &
  LongviewLoad &
  LongviewMemory &
  LongviewNetwork &
  LongviewSystemInfo &
  LongviewPackages &
  LongviewProcesses &
  Uptime &
  LongviewPortsResponse &
  LastUpdated &
  LongviewApplications;

export interface WithStartAndEnd {
  end: number;
  start: number;
}

export interface Get {
  (
    token: string,
    action: 'getLatestValue' | 'getValues' | 'lastUpdated',
    options?: Options
  ): Promise<LongviewResponse>;
  (
    token: string,
    action: 'getTopProcesses',
    options?: Options
  ): Promise<LongviewResponse<LongviewTopProcesses>>;
}

export type LongviewAction =
  | 'batch'
  | 'getLatestValue'
  | 'getTopProcesses'
  | 'getValue'
  | 'getValues'
  | 'lastUpdated';

export interface LongviewResponse<T = Partial<AllData>> {
  ACTION: LongviewAction;
  DATA: T;
  NOTIFICATIONS: LongviewNotification[];
  VERSION: number;
}

export interface LongviewNotification {
  CODE: number;
  SEVERITY: number;
  TEXT: string;
}

/**
 * Scaffolding; expand as we gather requirements.
 */

export type LongviewFieldName =
  | 'activeConnections'
  | 'apache'
  | 'apacheProcesses'
  | 'cpu'
  | 'disk'
  | 'listeningServices'
  | 'load'
  | 'memory'
  | 'mysql'
  | 'mysqlProcesses'
  | 'network'
  | 'nginx'
  | 'nginxProcesses'
  | 'packages'
  | 'processes'
  | 'sysinfo'
  | 'uptime';

export interface Options {
  end?: number;
  fields: LongviewFieldName[];
  start?: number;
}

export interface LongviewApplications {
  Applications?: {
    Apache?: ApacheResponse;
    MySQL?: MySQLResponse;
    Nginx?: NginxResponse;
  };
}

export interface NginxResponse {
  accepted_cons: Stat[];
  active: Stat[];
  handled_cons: Stat[];
  reading: Stat[];
  requests: Stat[];
  status: number;
  status_message: string;
  version: string;
  waiting: Stat[];
  writing: Stat[];
}

export interface ApacheResponse {
  status: number;
  status_message: string;
  'Total Accesses': Stat[];
  'Total kBytes': Stat[];
  version: string;
  Workers: Record<string, Stat[]>;
}

export interface MySQLResponse {
  Aborted_clients: Stat[];
  Aborted_connects: Stat[];
  Bytes_received: Stat[];
  Bytes_sent: Stat[];
  Com_delete: Stat[];
  Com_insert: Stat[];
  Com_select: Stat[];
  Com_update: Stat[];
  Connections: Stat[];
  Qcache_hits: Stat[];
  Qcache_inserts: Stat[];
  Qcache_lowmem_prunes: Stat[];
  Qcache_not_cached: Stat[];
  Qcache_queries_in_cache: Stat[];
  Slow_queries: Stat[];
  status: number;
  status_message: string;
  version: string;
}
