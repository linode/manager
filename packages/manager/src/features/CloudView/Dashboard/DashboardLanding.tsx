import { Dashboard } from '@linode/api-v4';
import { Divider, Paper } from '@mui/material';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import {
  useCloudViewDashboardByIdQuery,
  useCloudViewDashboardsQuery,
} from 'src/queries/cloudview/dashboards';

import { FiltersObject } from '../Models/GlobalFilterProperties';
import { GlobalFilters } from '../Overview/GlobalFilters';
import { CloudPulseDashboard, DashboardProperties } from './Dashboard';

export const DashBoardLanding = () => {
  const [dashboardProp, setDashboardProp] = React.useState<DashboardProperties>(
    {} as DashboardProperties
  );

  const dashboardId = 1;

  const {
    data: dashboard,
    isError: dashboardLoadError,
    isLoading: dashboardLoadLoding,
  } = useCloudViewDashboardsQuery();

  if (dashboardLoadLoding) {
    return <CircleProgress />;
  }

  if (dashboardLoadError) {
    return (
      <ErrorState
        errorText={
          'Error while fetching dashboards with id ' + 1 + ', please retry.'
        }
      ></ErrorState>
    );
  }

  const handleGlobalFilterChange = (globalFilter: FiltersObject) => {
    // set as dashboard filter
    setDashboardProp({ ...dashboardProp, dashboardFilters: globalFilter });
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

  const onDashboardSelect = () => {
    // todo, whatever when a new dashboard is loaded
  };

  const dashbaordChange = (dashboard: Dashboard) => {
    // todo, whenever a change in dashboard happens
  };

  return (
    // <Paper className={'graphpaper'}>
    <>
      <Paper>
        <div style={{ display: 'flex' }}>
          <div style={{ marginLeft: '10px', marginTop: '30px', width: '40%' }}>
            <h3>{'Dashboard 1'}</h3>
          </div>
          <div style={{ width: '80%' }}>
            <GlobalFilters
              handleAnyFilterChange={(filters: FiltersObject) =>
                handleGlobalFilterChange(filters)
              }
            ></GlobalFilters>
          </div>
        </div>
      </Paper>
      <Divider></Divider>
      <CloudPulseDashboard
        {...dashboardProp}
        dashbaord={dashboard.data[0]}
        onDashboardChange={dashbaordChange}
      />
    </>
    // </Paper>
  );
};
