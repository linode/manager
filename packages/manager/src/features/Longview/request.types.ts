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

interface Disk {
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

interface CPU {
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

export interface LongviewNetwork {
  Network: {
    mac_addr: string;
    Interface: {
      eth0: {
        rx_bytes: Stat[];
        tx_bytes: Stat[];
      };
    };
  };
}
