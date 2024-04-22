import { Widgets } from '@linode/api-v4/lib/cloudview/types';
import * as Factory from 'factory.ts';

import { cloudViewFilterFactory } from './cloudViewFilters';

export const cloudViewWidgetFactory = Factory.Sync.makeFactory<Widgets>({
  aggregate_function: '',
  chart_type: '',
  color: '',
  filters: cloudViewFilterFactory.buildList(2),
  group_by: 'dummy',
  label: Factory.each((i) => `widget-${i}`),
  metric: '200X',
  namespace_id: 0,
  region_id: 0,
  resource_id: [],
  serviceType: '',
  size: 0,
  time_duration: {
    unit: 'min',
    value: 5,
  },
  time_granularity: {
    unit: 'min',
    value: 1,
  },
  unit: 'Kb/s',
  y_label: 'Count',
});
