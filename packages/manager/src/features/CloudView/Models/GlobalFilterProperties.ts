import { Dashboard, TimeDuration, TimeGranularity } from '@linode/api-v4';

import { WithStartAndEnd } from 'src/features/Longview/request.types';

export interface GlobalFilterProperties {
  // globalFilters: FiltersObject;
  handleAnyFilterChange(
    updatedData : any,
    changedFilter : string    
  ): undefined | void;
  handleDashboardChange(dashboard: Dashboard | undefined): undefined | void;
  // region: string | undefined;
  // serviceType: string | undefined;
}

export interface FiltersObject {
  duration?: TimeDuration;
  durationLabel?: string;
  interval?: string;
  region?: string;
  resource: string[];
  serviceType?: string;
  step?: TimeGranularity;
  timeRange?: WithStartAndEnd;
  timestamp?: number | undefined;
}
