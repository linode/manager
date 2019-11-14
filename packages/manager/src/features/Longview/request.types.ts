interface Stat {
  x: number;
  y: number;
}

interface FS {
  itotal: Stat[];
  ifree: Stat[];
  total: Stat[];
  free: Stat[];
  path: string;
}

export interface Disk {
  dm: number;
  children: number;
  mounted: number;
  childof: number;
  isswap: number;
  write_bytes?: Stat[];
  writes?: Stat[];
  reads?: Stat[];
  read_bytes?: Stat[];
  fs: FS;
}
/*
  each key will be the name of the disk

  So if I have 1 ext disk and 1 swap, the keys might be:

  {
    /dev/sdb: Disk,
    /dev/sda: Disk
  }

*/
export interface LongviewDisk {
  Disk: Record<string, Disk>;
}

interface RealMemory {
  free: Stat[];
  buffers: Stat[];
  used: Stat[];
  cache: Stat[];
}

interface SwapMemory {
  free: Stat[];
  used: Stat[];
}

export interface LongviewMemory {
  Memory: {
    real: RealMemory;
    swap: SwapMemory;
  };
}

export interface CPU {
  user: Stat[];
  wait: Stat[];
  system: Stat[];
}

/*
  each key will be cpu${number}

  So if I have 2 CPUs, the keys will be:

  {
    cpu0: CPU,
    cpu1: CPU
  }

*/
export interface LongviewCPU {
  CPU: Record<string, CPU>;
}

export interface LongviewLoad {
  Load: Stat[];
}

export interface InboundOutboundNetwork {
  rx_bytes: Stat[];
  tx_bytes: Stat[];
}

export interface LongviewNetwork {
  Network: {
    mac_addr: string;
    Interface: Record<string, InboundOutboundNetwork>;
  };
}

export interface LastUpdated {
  updated: number;
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
