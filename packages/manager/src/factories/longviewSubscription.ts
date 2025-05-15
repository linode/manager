import { Factory } from '@linode/utilities';

import type {
  ActiveLongviewPlan,
  LongviewSubscription,
} from '@linode/api-v4/lib/longview/types';

export const longviewSubscriptionFactory =
  Factory.Sync.makeFactory<LongviewSubscription>({
    clients_included: Factory.each((i) => i),
    id: Factory.each((i) => `longview-${i}`),
    label: Factory.each((i) => `Longview Pro ${i} Pack`),
    price: {
      hourly: 0.03,
      monthly: 200,
    },
  });

export const longviewActivePlanFactory =
  Factory.Sync.makeFactory<ActiveLongviewPlan>({
    clients_included: 100,
    id: 'longview-3',
    label: 'Longview Pro 3 pack',
    price: {
      hourly: 0.03,
      monthly: 20,
    },
  });
