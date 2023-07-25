import { Agreements } from '@linode/api-v4/lib/account';
import * as Factory from 'factory.ts';

export const accountAgreementsFactory = Factory.Sync.makeFactory<Agreements>({
  eu_model: false,
  privacy_policy: true,
});
