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
  y: number | null;
}

interface FS<WithDummy extends '' | 'yAsNull' = ''> {
  itotal: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  ifree: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  total: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  free: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  path: string;
}

export interface Disk<WithDummy extends '' | 'yAsNull' = ''> {
  dm: number;
  children: number;
  mounted: number;
  childof: number;
  isswap: number;
  write_bytes?: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  writes?: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  reads?: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  read_bytes?: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  fs?: FS<WithDummy>;
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
  free: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  buffers: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  used: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  cache: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
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
  user: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  wait: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
  system: WithDummy extends 'yAsNull' ? StatWithDummyPoint[] : Stat[];
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

export type LongviewNetworkInterface<
  WithDummy extends '' | 'yAsNull' = ''
> = Record<string, InboundOutboundNetwork<WithDummy>>;
export interface LongviewNetwork<WithDummy extends '' | 'yAsNull' = ''> {
  Network: {
    mac_addr: string;
    Interface: LongviewNetworkInterface<WithDummy>;
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
export interface LongviewProcesses<WithDummy extends '' | 'yAsNull' = ''> {
  Processes?: Record<string, Process<WithDummy>>;
}

export type Process<WithDummy extends '' | 'yAsNull' = ''> = {
  longname: string;
} & Record<string, ProcessStats<WithDummy>>;

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
  mem: number;
  entries: number;
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
  start: number;
  end: number;
}

export interface Get {
  (
    token: string,
    action: 'lastUpdated' | 'getLatestValue' | 'getValues',
    options?: Options
  ): Promise<LongviewResponse>;
  (token: string, action: 'getTopProcesses', options?: Options): Promise<
    LongviewResponse<LongviewTopProcesses>
  >;
}

export type LongviewAction =
  | 'batch'
  | 'getTopProcesses'
  | 'getLatestValue'
  | 'getValue'
  | 'getValues'
  | 'lastUpdated';

export interface LongviewResponse<T = Partial<AllData>> {
  VERSION: number;
  ACTION: LongviewAction;
  DATA: T;
  NOTIFICATIONS: LongviewNotification[];
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
  | 'cpu'
  | 'uptime'
  | 'memory'
  | 'load'
  | 'sysinfo'
  | 'network'
  | 'disk'
  | 'packages'
  | 'processes'
  | 'listeningServices'
  | 'activeConnections'
  | 'nginx'
  | 'nginxProcesses'
  | 'apache'
  | 'apacheProcesses'
  | 'mysql'
  | 'mysqlProcesses';

export interface Options {
  fields: LongviewFieldName[];
  start?: number;
  end?: number;
}

export interface LongviewApplications {
  Applications?: {
    Nginx?: NginxResponse;
    Apache?: ApacheResponse;
    MySQL?: MySQLResponse;
  };
}

export interface NginxResponse {
  version: string;
  status: number;
  status_message: string;
  requests: Stat[];
  writing: Stat[];
  accepted_cons: Stat[];
  handled_cons: Stat[];
  reading: Stat[];
  waiting: Stat[];
  active: Stat[];
}

export interface ApacheResponse {
  Workers: Record<string, Stat[]>;
  status_message: string;
  version: string;
  status: number;
  'Total kBytes': Stat[];
  'Total Accesses': Stat[];
}

export interface MySQLResponse {
  status_message: string;
  status: number;
  version: string;
  Qcache_hits: Stat[];
  Qcache_inserts: Stat[];
  Qcache_lowmem_prunes: Stat[];
  Qcache_not_cached: Stat[];
  Qcache_queries_in_cache: Stat[];
  Com_insert: Stat[];
  Com_delete: Stat[];
  Com_select: Stat[];
  Com_update: Stat[];
  Connections: Stat[];
  Bytes_received: Stat[];
  Bytes_sent: Stat[];
  Slow_queries: Stat[];
  Aborted_clients: Stat[];
  Aborted_connects: Stat[];
}
