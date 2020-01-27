import * as Factory from 'factory.ts';
import {
  LongviewTopProcesses,
  TopProcess
} from 'src/features/Longview/request.types';

export const topProcessFactory = Factory.Sync.makeFactory<TopProcess>({
  root: {
    cpu: 5,
    mem: 1024 * 2,
    count: 1,
    entries: 2
  }
});

export const longviewTopProcessesFactory = Factory.Sync.makeFactory<
  LongviewTopProcesses
>({
  Processes: {
    bash: topProcessFactory.build(),
    sshd: topProcessFactory.build(),
    systemd: topProcessFactory.build()
  }
});
