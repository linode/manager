import Factory from 'src/factories/factoryProxy';

import type {
  CPU,
  Disk,
  InboundOutboundNetwork,
  LongviewCPU,
  LongviewDisk,
  LongviewLoad,
  LongviewMemory,
  LongviewNetwork,
  LongviewNetworkInterface,
  LongviewSystemInfo,
  Uptime,
} from 'src/features/Longview/request.types';

const mockStats = [
  { x: 1717770900, y: 0 },
  { x: 1717770900, y: 20877.4637037037 },
  { x: 1717770900, y: 4.09420479302832 },
  { x: 1717770900, y: 83937959936 },
  { x: 1717770900, y: 5173267 },
  { x: 1717770900, y: 5210112 },
  { x: 1717770900, y: 82699642934.6133 },
  { x: 1717770900, y: 0.0372984749455338 },
  { x: 1717770900, y: 0.00723311546840959 },
  { x: 1717770900, y: 0.0918300653594771 },
  { x: 1717770900, y: 466.120718954248 },
  { x: 1717770900, y: 451.9651416122 },
  { x: 1717770900, y: 524284 },
  { x: 1717770900, y: 547242.706666667 },
  { x: 1717770900, y: 3466265.29333333 },
  { x: 1717770900, y: 57237.6133333333 },
  { x: 1717770900, y: 365385.893333333 },
];

export const diskFactory = Factory.Sync.makeFactory<Disk>({
  childof: 0,
  children: 0,
  dm: 0,
  fs: {
    free: [mockStats[6]],
    ifree: [mockStats[4]],
    itotal: [mockStats[5]],
    path: '/',
    total: [mockStats[3]],
  },
  isswap: 0,
  mounted: 1,
  read_bytes: [mockStats[0]],
  reads: [mockStats[0]],
  write_bytes: [mockStats[1]],
  writes: [mockStats[2]],
});

export const cpuFactory = Factory.Sync.makeFactory<CPU>({
  system: [mockStats[7]],
  user: [mockStats[9]],
  wait: [mockStats[8]],
});

export const longviewDiskFactory = Factory.Sync.makeFactory<LongviewDisk>({
  Disk: {
    '/dev/sda': diskFactory.build(),
    '/dev/sdb': diskFactory.build({ isswap: 1 }),
  },
});

export const longviewCPUFactory = Factory.Sync.makeFactory<LongviewCPU>({
  CPU: {
    cpu0: cpuFactory.build(),
    cpu1: cpuFactory.build(),
  },
});

export const longviewSysInfoFactory = Factory.Sync.makeFactory<LongviewSystemInfo>(
  {
    SysInfo: {
      arch: 'x86_64',
      client: '1.1.5',
      cpu: {
        cores: 2,
        type: 'AMD EPYC 7713 64-Core Processor',
      },
      hostname: 'localhost',
      kernel: 'Linux 5.10.0-28-amd64',
      os: {
        dist: 'Debian',
        distversion: '11.9',
      },
      type: 'kvm',
    },
  }
);

export const InboundOutboundNetworkFactory = Factory.Sync.makeFactory<InboundOutboundNetwork>(
  {
    rx_bytes: [mockStats[10]],
    tx_bytes: [mockStats[11]],
  }
);

export const LongviewNetworkInterfaceFactory = Factory.Sync.makeFactory<LongviewNetworkInterface>(
  {
    eth0: InboundOutboundNetworkFactory.build(),
  }
);

export const longviewNetworkFactory = Factory.Sync.makeFactory<LongviewNetwork>(
  {
    Network: {
      Interface: LongviewNetworkInterfaceFactory.build(),
      mac_addr: 'f2:3c:94:e6:81:e2',
    },
  }
);

export const LongviewMemoryFactory = Factory.Sync.makeFactory<LongviewMemory>({
  Memory: {
    real: {
      buffers: [mockStats[15]],
      cache: [mockStats[16]],
      free: [mockStats[14]],
      used: [mockStats[13]],
    },
    swap: {
      free: [mockStats[12]],
      used: [mockStats[0]],
    },
  },
});

export const LongviewLoadFactory = Factory.Sync.makeFactory<LongviewLoad>({
  Load: [mockStats[0]],
});

export const UptimeFactory = Factory.Sync.makeFactory<Uptime>({
  Uptime: 84516.53,
});
