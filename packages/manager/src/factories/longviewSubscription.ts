import * as Factory from 'factory.ts';
import { LongviewSubscription } from 'linode-js-sdk/lib/longview/types';

export const longviewSubscriptionFactory = Factory.Sync.makeFactory<
  LongviewSubscription
>({
  id: Factory.each(i => `longview-${i}`),
  label: Factory.each(i => `Longview Pro ${i} Pack`),
  clients_included: Factory.each(i => i),
  price: {
    hourly: 0.03,
    monthly: 200
  }
});
