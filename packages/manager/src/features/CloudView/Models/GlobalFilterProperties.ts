import { Dashboard, TimeDuration, TimeGranularity } from '@linode/api-v4';

import { WithStartAndEnd } from 'src/features/Longview/request.types';

export interface GlobalFilterProperties {
  filterPreferences?: any;
  globalFilters: FiltersObject;
  handleAnyFilterChange(
    filters: FiltersObject,
    changedFilter: string
  ): undefined | void;
  handleDashboardChange(dashboard: Dashboard): undefined | void;
}

export interface FiltersObject {
  duration?: TimeDuration;
  durationLabel: string;
  interval: string;
  region: string;
  resource: string[];
  serviceType?: string;
  step?: TimeGranularity;
  timeRange?: WithStartAndEnd;
  timestamp?: number | undefined;
}
