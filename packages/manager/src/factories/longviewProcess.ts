import { Factory } from '@linode/utilities';

import {
  LongviewProcesses,
  ProcessStats,
} from 'src/features/Longview/request.types';

const mockStats = [
  { x: 0, y: 1 },
  { x: 0, y: 2 },
  { x: 0, y: 3 },
];

const mockProcess = Factory.Sync.makeFactory<ProcessStats>({
  count: mockStats,
  cpu: mockStats,
  ioreadkbytes: mockStats,
  iowritekbytes: mockStats,
  mem: mockStats,
});

export const longviewProcessFactory = Factory.Sync.makeFactory<LongviewProcesses>(
  {
    Processes: {
      bash: {
        longname: '/usr/sbin/cron',
        root: mockProcess.build(),
      } as any,
      sshd: {
        longname: '/usr/sbin/cron',
        root: mockProcess.build(),
      } as any,
      systemd: {
        longname: '/usr/sbin/cron',
        root: mockProcess.build(),
      } as any,
    },
  }
);
