import {
  EntityTransfer,
  TransferEntities,
} from '@linode/api-v4/lib/entity-transfers/types';
import Factory from 'src/factories/factoryProxy';
import { DateTime } from 'luxon';

export const transferEntitiesFactory = Factory.Sync.makeFactory<TransferEntities>(
  {
    linodes: [0, 1, 2, 3],
  }
);

export const entityTransferFactory = Factory.Sync.makeFactory<EntityTransfer>({
  created: DateTime.utc().toISO(),
  entities: transferEntitiesFactory.build(),
  expiry: DateTime.utc().plus({ days: 1 }).toISO(),
  is_sender: true,
  status: 'pending',
  token: Factory.each(() => crypto.randomUUID()),
  updated: DateTime.utc().toISO(),
});
