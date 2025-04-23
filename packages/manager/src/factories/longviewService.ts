import { Factory } from '@linode/utilities';

import {
  LongviewPort,
  LongviewPortsResponse,
  LongviewService,
} from 'src/features/Longview/request.types';

export const longviewPortFactory = Factory.Sync.makeFactory<LongviewPort>({
  count: Factory.each((i) => i),
  name: Factory.each((i) => `test-name-${i}`),
  user: Factory.each((i) => `test-user-${i}`),
});

export const longviewServiceFactory = Factory.Sync.makeFactory<LongviewService>(
  {
    ip: '0.0.0.0',
    name: 'sshd',
    port: 22,
    type: 'tcp',
    user: Factory.each((i) => `test-user-${i}`),
  }
);

export const longviewPortsResponseFactory = Factory.Sync.makeFactory<LongviewPortsResponse>(
  {
    Ports: {
      active: longviewPortFactory.buildList(2),
      listening: longviewServiceFactory.buildList(2),
    },
  }
);
