import * as Factory from 'factory.ts';
import {
  LongviewPort,
  LongviewPortsResponse,
  LongviewService
} from 'src/features/Longview/request.types';

export const longviewPortFactory = Factory.Sync.makeFactory<LongviewPort>({
  count: Factory.each(i => i),
  user: Factory.each(i => `test-user-${i}`),
  name: Factory.each(i => `test-name-${i}`)
});

export const longviewServiceFactory = Factory.Sync.makeFactory<LongviewService>(
  {
    user: Factory.each(i => `test-user-${i}`),
    ip: '0.0.0.0',
    port: 22,
    type: 'tcp',
    name: 'sshd'
  }
);

export const longviewPortsResponseFactory = Factory.Sync.makeFactory<
  LongviewPortsResponse
>({
  listening: longviewServiceFactory.buildList(2),
  active: longviewPortFactory.buildList(2)
});
