import { Beta, AccountBeta } from '@linode/api-v4';
import * as Factory from 'factory.ts';
import { DateTime } from 'luxon';

export const betaFactory = Factory.Sync.makeFactory<Beta>({
  id: Factory.each((i) => `beta-${i}`),
  label: Factory.each((i) => `Beta ${i}`),
  started: DateTime.now().toISO(),
});

export const accountBetaFactory = Factory.Sync.makeFactory<AccountBeta>({
  ...betaFactory.build({ started: DateTime.now().minus({ days: 30 }).toISO() }),
  enrolled: DateTime.now().toISO(),
});
