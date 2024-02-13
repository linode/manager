import { Namespace } from '@linode/api-v4/lib/cloudview/types';
import * as Factory from 'factory.ts';

export const namespaceFactory = Factory.Sync.makeFactory<Namespace>({
  id: Factory.each((i) => i),
  label: Factory.each((i) => `cloudview-${i}`),
  region: 'us-east',
  type: 'metric',
  urls: {
    ingest: 'https://cloudviewtestingest.com',
    read: 'https://cloudviewtestread.com',
    // eslint-disable-next-line perfectionist/sort-objects
    agent_install: 'https://cloudviewtestinstall.com',
  },
  // eslint-disable-next-line perfectionist/sort-objects
  created: '2023-07-12T16:08:53',
  updated: '2023-07-12T16:08:55',
});
