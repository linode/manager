import { Agreements } from '@linode/api-v4/lib/account';
import Factory from 'src/factories/factoryProxy';

export const accountAgreementsFactory = Factory.Sync.makeFactory<Agreements>({
  eu_model: false,
  privacy_policy: true,
});
