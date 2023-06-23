import {
  EntityTransfer,
  TransferEntities,
} from '@linode/api-v4/lib/entity-transfers/types';
import * as Factory from 'factory.ts';
import { DateTime } from 'luxon';
import { v4 } from 'uuid';

export const transferEntitiesFactory =
  Factory.Sync.makeFactory<TransferEntities>({
    linodes: [0, 1, 2, 3],
  });

export const entityTransferFactory = Factory.Sync.makeFactory<EntityTransfer>({
  token: Factory.each(() => v4()),
  is_sender: true,
  entities: transferEntitiesFactory.build(),
  expiry: DateTime.utc().plus({ days: 1 }).toISO(),
  created: DateTime.utc().toISO(),
  updated: DateTime.utc().toISO(),
  status: 'pending',
});
