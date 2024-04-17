import { TimeDuration, TimeGranularity } from '@linode/api-v4';

import { WithStartAndEnd } from 'src/features/Longview/request.types';

export interface GlobalFilterProperties {
  handleAnyFilterChange(filters: FiltersObject): undefined | void;
}

export interface FiltersObject {
  duration?: TimeDuration;
  interval: string;
  region: string;
  resource: string[];
  serviceType?: string;
  step?: TimeGranularity;
  timeRange: WithStartAndEnd;
}
