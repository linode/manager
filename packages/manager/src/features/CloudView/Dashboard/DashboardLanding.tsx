import { Dashboard } from '@linode/api-v4';
import { Paper } from '@mui/material';
import * as React from 'react';

import { FiltersObject } from '../Models/GlobalFilterProperties';
import { GlobalFilters } from '../Overview/GlobalFilters';
import { CloudPulseDashboard, DashboardProperties } from './Dashboard';

export const DashBoardLanding = () => {
  const [dashboardProp, setDashboardProp] = React.useState<DashboardProperties>(
    {} as DashboardProperties
  );

  const updatedDashboard = React.useRef<Dashboard>();

  const handleGlobalFilterChange = (globalFilter: FiltersObject) => {
    // set as dashboard filter
    setDashboardProp({
      ...dashboardProp,
      dashboard: updatedDashboard.current!,
      dashboardFilters: globalFilter,
    });
  };

  const handleDashboardChange = (dashboard: Dashboard) => {
    setDashboardProp({ ...dashboardProp, dashbaord: dashboard });
    updatedDashboard.current = { ...dashboard };
  };

  const saveOrEditDashboard = (dashboard: Dashboard) => {
    // todo, implement save option
  };

  const deleteDashboard = (dashboardId: number) => {
    // todo, implement delete option
  };

  const markDashboardAsFavorite = () => {
    // todo, implement mark dashboard as favorite
  };

  const resetView = () => {
    // todo, implement the reset view function
  };

  const dashboardChange = (dashboardObj: Dashboard) => {
    // todo, whenever a change in dashboard happens
    updatedDashboard.current = { ...dashboardObj };
  };

  return (
    <>
      <Paper>
        <div style={{ display: 'flex' }}>
          <div style={{ width: '100%' }}>
            <GlobalFilters
              handleAnyFilterChange={(filters: FiltersObject) =>
                handleGlobalFilterChange(filters)
              }
              handleDashboardChange={(dashboardObj: Dashboard) =>
                handleDashboardChange(dashboardObj)
              }
            ></GlobalFilters>
          </div>
        </div>
      </Paper>
      <CloudPulseDashboard
        {...dashboardProp}
        onDashboardChange={dashboardChange}
      />
    </>
  );
};
