import { LKEPlan } from '@linode/api-v4';
import * as Factory from 'factory.ts';

export const kubernetesTypeFactory = Factory.Sync.makeFactory<LKEPlan>({
  id: 'lke-standard',
  label: 'LKE Standard',
  price: {
    hourly: 0.15,
    monthly: 100,
  },
  availability: 'high',
});
