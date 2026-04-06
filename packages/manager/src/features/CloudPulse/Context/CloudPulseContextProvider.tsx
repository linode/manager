import * as React from 'react';

import { CloudPulseContext } from './CloudPulseContext';

import type { FilterData } from '../Dashboard/CloudPulseDashboardLanding';
import type { Dashboard } from '@linode/api-v4';

interface CloudPulseProviderProps {
  /**
   * The children of the provider, which will have access to the CloudPulse context
   */
  children: React.ReactNode;
}

export const CloudPulseContextProvider = ({
  children,
}: CloudPulseProviderProps) => {
  const globalFilterData = React.useRef<FilterData | undefined>(undefined);
  const globalSelectedDashboard = React.useRef<Dashboard | undefined>(
    undefined
  );
  const globalGroupBy = React.useRef<string[]>([]);

  const setGlobalFilterData = React.useCallback((filterData: FilterData) => {
    globalFilterData.current = filterData;
  }, []);

  const getGlobalFilterData = React.useCallback(() => {
    return globalFilterData.current;
  }, []);

  const setGlobalSelectedDashboard = React.useCallback(
    (dashboard: Dashboard) => {
      // Placeholder for potential future use if we need to register dashboard-level data
      globalSelectedDashboard.current = dashboard;
    },
    []
  );

  const getGlobalSelectedDashboard = React.useCallback(() => {
    return globalSelectedDashboard.current;
  }, []);

  const setGlobalGroupBy = React.useCallback((groupBy: string[]) => {
    globalGroupBy.current = groupBy;
  }, []);

  const getGlobalGroupBy = React.useCallback(() => {
    return globalGroupBy.current;
  }, []);

  return (
    <CloudPulseContext.Provider
      value={{
        setGlobalFilterData,
        getGlobalFilterData,
        setGlobalSelectedDashboard,
        getGlobalSelectedDashboard,
        setGlobalGroupBy,
        getGlobalGroupBy,
      }}
    >
      {children}
    </CloudPulseContext.Provider>
  );
};
