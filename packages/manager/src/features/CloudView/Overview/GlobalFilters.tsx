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
import { REFRESH, REGION, RESOURCES, TIME_DURATION } from '../Utils/CloudPulseConstants';
import { updateGlobalFilterPreference } from '../Utils/UserPreference';

export const GlobalFilters = React.memo((props: GlobalFilterProperties) => {
  const emitGlobalFilterChange = (
    updatedData: any,
    changedFilter: string
  ) => {
    props.handleAnyFilterChange(updatedData, changedFilter);
  };

  const [selectedDashboard, setSelectedDashboard] = React.useState<Dashboard | undefined>();

  const [selectedRegion, setSelectedRegion] = React.useState<string | undefined>();

  const handleTimeRangeChange = React.useCallback(
    (
      start: number,
      end: number,
      timeDuration?: TimeDuration,
      timeRangeLabel?: string
    ) => {
      if (start > 0 && end > 0) {
        const filterObj = {} as FiltersObject;
        filterObj.timeRange = { end, start };
        filterObj.duration = timeDuration;
        filterObj.durationLabel = timeRangeLabel!;
        emitGlobalFilterChange(filterObj.duration, TIME_DURATION);
        updateGlobalFilterPreference({
          [TIME_DURATION]: filterObj.durationLabel,
        });
      }
    },
    []
  );

  const handleRegionChange = React.useCallback((region: string | undefined) => {
    if (region && region === selectedRegion) {
      return;
    }
    setSelectedRegion(region);
    emitGlobalFilterChange(region, REGION);
  }, []);

  const handleResourceChange = React.useCallback(
    (resourceId: any[]) => {
      emitGlobalFilterChange(
        resourceId?.map((obj) => obj.id) ?? [],
        RESOURCES
      );
    },
    []
  );

  const handleDashboardChange = React.useCallback(
    (dashboard: Dashboard | undefined) => {
      if (dashboard && selectedDashboard?.id === dashboard.id) {
        return;
      }
      setSelectedDashboard(dashboard);

      props.handleDashboardChange(dashboard);
    },
    []
  );

  const handleGlobalRefresh = React.useCallback(() => {
    emitGlobalFilterChange(
      Date.now(),
      REFRESH
    );
  }, []);
  return (
    <Grid container sx={{ ...itemSpacing, padding: '8px' }}>
      <StyledGrid xs={12}>
        <Grid sx={{ width: 300 }}>
          <CloudViewDashboardSelect

            handleDashboardChange={handleDashboardChange}
          />
        </Grid>
        <Grid sx={{ marginLeft: 4, width: 200 }}>
          <StyledCloudViewRegionSelect

            handleRegionChange={handleRegionChange}
            selectedDashboard={selectedDashboard}
          />
        </Grid>
        <Grid sx={{ marginLeft: 4, width: 450 }}>
          <StyledCloudViewResourceSelect

            disabled={!selectedRegion || !selectedDashboard?.service_type}
            handleResourceChange={handleResourceChange}
            region={selectedRegion}
            resourceType={selectedDashboard?.service_type}
          />
        </Grid>
        <Grid sx={{ marginLeft: 3, width: 250 }}>
          <StyledCloudViewTimeRangeSelect
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
