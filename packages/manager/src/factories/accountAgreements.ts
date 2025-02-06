import Factory from 'src/factories/factoryProxy';

import type { Agreements } from '@linode/api-v4/lib/account';

export const accountAgreementsFactory = Factory.Sync.makeFactory<Agreements>({
  billing_agreement: false,
  eu_model: false,
  privacy_policy: true,
});
