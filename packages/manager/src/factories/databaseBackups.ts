import { DatabaseBackup } from '@linode/api-v4/lib/databases';
import * as Factory from 'factory.ts';
import { v4 } from 'uuid';

export const DatabaseBackupFactory = Factory.Sync.makeFactory<DatabaseBackup>({
  id: Factory.each(() => v4()),
  status: 'running',
  created: '2020-10-01T00:00:00',
  finished: '2020-10-01T00:00:25'
});
