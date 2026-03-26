import React from 'react';

import type { FilterData } from '../Dashboard/CloudPulseDashboardLanding';
import type { Dashboard } from '@linode/api-v4';

export type CloudPulseRegistry = {
  getGlobalFilterData: () => FilterData | undefined;
  getGlobalGroupBy: () => string[];
  getGlobalSelectedDashboard: () => Dashboard | undefined;
  setGlobalFilterData: (filterData: FilterData) => void;
  setGlobalGroupBy: (groupBy: string[]) => void;
  setGlobalSelectedDashboard: (dashboard: Dashboard) => void;
};

export const CloudPulseContext = React.createContext<CloudPulseRegistry>({
  getGlobalFilterData: () => undefined,
  getGlobalSelectedDashboard: () => undefined,
  setGlobalSelectedDashboard: () => null,
  setGlobalFilterData: () => null,
  setGlobalGroupBy: () => null,
  getGlobalGroupBy: () => [],
});
