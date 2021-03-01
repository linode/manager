import * as Factory from 'factory.ts';
import {
  ActiveLongviewPlan,
  LongviewSubscription,
} from '@linode/api-v4/lib/longview/types';

export const longviewSubscriptionFactory = Factory.Sync.makeFactory<LongviewSubscription>(
  {
    id: Factory.each((i) => `longview-${i}`),
    label: Factory.each((i) => `Longview Pro ${i} Pack`),
    clients_included: Factory.each((i) => i),
    price: {
      hourly: 0.03,
      monthly: 200,
    },
  }
);

export const longviewActivePlanFactory = Factory.Sync.makeFactory<ActiveLongviewPlan>(
  {
    id: 'longview-3',
    label: 'Longview Pro 3 pack',
    price: {
      hourly: 0.03,
      monthly: 20,
    },
    clients_included: 100,
  }
);
