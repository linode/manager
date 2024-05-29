/* eslint-disable no-console */
import { Dashboard, TimeDuration } from '@linode/api-v4';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import Reload from 'src/assets/icons/reload.svg';

import {
  FiltersObject,
  GlobalFilterProperties,
} from '../Models/GlobalFilterProperties';
import { CloudViewDashboardSelect } from '../shared/DashboardSelect';
import { CloudViewRegionSelect } from '../shared/RegionSelect';
import { CloudViewMultiResourceSelect } from '../shared/ResourceMultiSelect';
import { CloudPulseTimeRangeSelect } from '../shared/TimeRangeSelect';


import { updateGlobalFilterPreference } from '../Utils/UserPreference';
import { TIME_DURATION, INTERVAL, REGION, RESOURCES } from '../Utils/CloudPulseConstants';

export const GlobalFilters = React.memo((props: GlobalFilterProperties) => {
  const emitGlobalFilterChange = (
    updatedFilters: FiltersObject,
    changedFilter: string
  ) => {
    props.handleAnyFilterChange(updatedFilters, changedFilter);
  };

  const handleTimeRangeChange = React.useCallback((
    start: number,
    end: number,
    timeDuration?: TimeDuration,
    timeRangeLabel?: string
  ) => {

    if (start > 0 && end > 0) {
      const filterObj = { ...props.globalFilters };
      filterObj.timeRange = { end, start };
      filterObj.duration = timeDuration;
      filterObj.durationLabel = timeRangeLabel!;
      emitGlobalFilterChange(filterObj, TIME_DURATION);
      updateGlobalFilterPreference({ [TIME_DURATION]: filterObj.durationLabel });
    }
  }, []);



  const handleRegionChange = React.useCallback((region: string | undefined) => {

    if (region) {
      emitGlobalFilterChange({ ...props.globalFilters, region }, REGION);
      updateGlobalFilterPreference({ [REGION]: region, [RESOURCES]: [] });
    }
  }, []);

  const handleResourceChange = React.useCallback((resourceId: any[], reason: string) => {
    if ((resourceId && resourceId.length > 0) || (reason == 'clear' || reason === "removeOption")) {
      updateGlobalFilterPreference({ [RESOURCES]: resourceId.map((obj) => obj.id) });
      emitGlobalFilterChange(
        {
          ...props.globalFilters,
          resource: resourceId.map((obj) => obj.id),
        },
        RESOURCES
      );
    }
  }, []);

  const handleDashboardChange = React.useCallback((
    dashboard: Dashboard | undefined,
    isClear: boolean
  ) => {

    if (dashboard || (!dashboard && !isClear)) {
      props.handleDashboardChange(dashboard!);
    }
  }, []);

  const handleGlobalRefresh = React.useCallback(() => {
    emitGlobalFilterChange(
      {
        ...props.globalFilters,
        timestamp: Date.now()
      },
      'refresh'
    );
  }, [])





  return (
    <Grid container sx={{ ...itemSpacing, padding: '8px' }}>
      <StyledGrid xs={12}>
        <Grid sx={{ width: 300 }}>
          <CloudViewDashboardSelect
            defaultValue={
              props.filterPreferences && props.filterPreferences.dashboardId
                ? props.filterPreferences.dashboardId
                : undefined
            }
            handleDashboardChange={handleDashboardChange}
          />
        </Grid>
        <Grid sx={{ marginLeft: 4, width: 200 }}>
          <StyledCloudViewRegionSelect
            defaultValue={
              props.filterPreferences
                ? props.filterPreferences.region
                : undefined
            }
            handleRegionChange={handleRegionChange}
          />
        </Grid>
        <Grid sx={{ marginLeft: 4, width: 450 }}>
          <StyledCloudViewResourceSelect
            defaultValue={
              props.filterPreferences && props.filterPreferences.resources
                ? props.filterPreferences.resources
                : []
            }
            disabled={
              !props.globalFilters.serviceType || !props.globalFilters.region
            }
            handleResourceChange={handleResourceChange}
            region={props.globalFilters.region}
            resourceType={props.globalFilters.serviceType}
          />
        </Grid>
        <Grid sx={{ marginLeft: 3, width: 250 }}>
          <StyledCloudViewTimeRangeSelect
            defaultValue={
              props.filterPreferences && props.filterPreferences.timeDuration
                ? props.filterPreferences.timeDuration
                : 'Past 30 Minutes'
            }
            handleStatsChange={handleTimeRangeChange}
            hideLabel
            label="Select Time Range"
          />
        </Grid>
        <Grid sx={{ marginLeft: -4, marginRight: 3 }}>
          <StyledReload onClick={handleGlobalRefresh} />
        </Grid>
      </StyledGrid>
    </Grid>
  );
});

const StyledCloudViewRegionSelect = styled(CloudViewRegionSelect, {
  label: 'StyledCloudViewRegionSelect',
})({
  width: 100,
});

const StyledCloudViewResourceSelect = styled(CloudViewMultiResourceSelect, {
  label: 'StyledCloudViewResourceSelect',
})({
  width: 230,
});

const StyledCloudViewTimeRangeSelect = styled(CloudPulseTimeRangeSelect, {
  label: 'StyledCloudViewTimeRangeSelect',
})({
  width: 140,
});

const StyledGrid = styled(Grid, { label: 'StyledGrid' })(({ theme }) => ({
  alignItems: 'end',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'start',
  marginBottom: theme.spacing(1.25),
}));

const itemSpacing = {
  boxSizing: 'border-box',
  margin: '0',
};

const StyledReload = styled(Reload, { label: 'StyledReload' })(({ theme }) => ({
  '&:active': {
    color: 'green',
  },
  '&:hover': {
    cursor: 'pointer',
  },
  height: '27px',
  width: '27px',
}));
