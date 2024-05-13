/* eslint-disable no-console */
import { Dashboard, TimeDuration, TimeGranularity } from '@linode/api-v4';
import { styled, useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { fileURLToPath } from 'url';

import { WithStartAndEnd } from 'src/features/Longview/request.types';

import {
  FiltersObject,
  GlobalFilterProperties,
} from '../Models/GlobalFilterProperties';
import { CloudViewDashboardSelect } from '../shared/DashboardSelect';
import { CloudViewIntervalSelect } from '../shared/IntervalSelect';
import { CloudViewRegionSelect } from '../shared/RegionSelect';
import { CloudViewMultiResourceSelect } from '../shared/ResourceMultiSelect';
import { CloudViewResourceTypes } from '../shared/ResourceSelect';
import { CloudPulseTimeRangeSelect } from '../shared/TimeRangeSelect';

export const GlobalFilters = React.memo((props: GlobalFilterProperties) => {
  const emitGlobalFilterChange = (
    updatedFilters: FiltersObject,
    changedFilter: string
  ) => {
    props.handleAnyFilterChange(updatedFilters, changedFilter);
  };

  const handleTimeRangeChange = (
    start: number,
    end: number,
    timeDuration?: TimeDuration,
    timeRangeLabel?: string
  ) => {
    console.log('TimeRange: ', start, end);

    if (start > 0 && end > 0) {
      const filterObj = { ...props.globalFilters };
      filterObj.timeRange = { end, start };
      filterObj.duration = timeDuration;
      filterObj.durationLabel = timeRangeLabel!;
      emitGlobalFilterChange(filterObj, 'timeduration');
    }
  };

  const handleIntervalChange = (interval: string | undefined) => {
    console.log('Interval: ', interval);

    if (interval) {
      const filterObj = { ...props.globalFilters };
      filterObj.interval = interval;
      filterObj.step = getIntervalToGranularity(interval);
      emitGlobalFilterChange(filterObj, 'timestep');
    }
  };

  const handleRegionChange = (region: string | undefined) => {
    console.log('Region: ', region);

    if (region) {
      emitGlobalFilterChange({ ...props.globalFilters, region }, 'region');
    }
  };

  const handleResourceChange = (resourceId: any[]) => {
    console.log('Resource ID: ', resourceId);
    if (resourceId && resourceId.length > 0) {
      emitGlobalFilterChange(
        {
          ...props.globalFilters,
          resource: resourceId.map((obj) => obj.id),
        },
        'resource'
      );
    }
  };

  const handleDashboardChange = (dashboard: Dashboard | undefined) => {
    console.log('Selected Dashboard: ', dashboard);

    if (dashboard) {
      props.handleDashboardChange(dashboard);
    }
  };

  const getIntervalToGranularity = (interval: string | undefined) => {
    if (interval == undefined) {
      return undefined!;
    }
    if (interval == '1m' || interval == '1minute') {
      return { unit: 'min', value: 1 };
    }

    if (interval == '5minute') {
      return { unit: 'min', value: 5 };
    }

    if (interval == '2hour') {
      return { unit: 'hr', value: 2 };
    }

    if (interval == '1day') {
      return { unit: 'day', value: 1 };
    }

    return undefined!;
  };

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
        <Grid sx={{ marginLeft: 2, width: 200 }}>
          <StyledCloudViewRegionSelect
            defaultValue={
              props.filterPreferences
                ? props.filterPreferences.region
                : undefined
            }
            handleRegionChange={handleRegionChange}
          />
        </Grid>
        <Grid sx={{ marginLeft: 3, width: 450 }}>
          <StyledCloudViewResourceSelect
            defaultValue={
              props.filterPreferences && props.filterPreferences.resources
                ? props.filterPreferences.resources
                : []
            }
            disabled={!props.globalFilters.serviceType}
            handleResourceChange={handleResourceChange}
            region={props.globalFilters.region}
            resourceType={props.globalFilters.serviceType}
          />
        </Grid>
        <Grid sx={{ marginLeft: 5 }}>
          <StyledCloudViewIntervalSelect
            defaultValue={
              props.filterPreferences && props.filterPreferences.interval
                ? props.filterPreferences.interval
                : undefined
            }
            handleIntervalChange={handleIntervalChange}
          />
        </Grid>
        <Grid sx={{ marginLeft: 12, width: 250 }}>
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

const StyledCloudViewIntervalSelect = styled(CloudViewIntervalSelect, {
  label: 'StyledCloudViewIntervalSelect',
})({
  marginRight: 10,
  width: 20,
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
