import * as Factory from 'factory.ts';

import {
  LongviewTopProcesses,
  TopProcess,
} from 'src/features/Longview/request.types';

export const topProcessFactory = Factory.Sync.makeFactory<TopProcess>({
  root: {
    count: 1,
    cpu: 5,
    entries: 2,
    mem: 1024 * 2,
  },
});

export const longviewTopProcessesFactory = Factory.Sync.makeFactory<LongviewTopProcesses>(
  {
    Processes: {
      bash: topProcessFactory.build(),
      sshd: topProcessFactory.build(),
      systemd: topProcessFactory.build(),
    },
  }
);
