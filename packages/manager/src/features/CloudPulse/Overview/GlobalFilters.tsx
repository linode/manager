import { IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import Reload from 'src/assets/icons/reload.svg';

import { CloudPulseDashboardFilterBuilder } from '../shared/CloudPulseDashboardFilterBuilder';
import { CloudPulseDashboardSelect } from '../shared/CloudPulseDashboardSelect';
import { CloudPulseRegionSelect } from '../shared/CloudPulseRegionSelect';
import { CloudPulseResourcesSelect } from '../shared/CloudPulseResourcesSelect';
import { CloudPulseTimeRangeSelect } from '../shared/CloudPulseTimeRangeSelect';

import type { CloudPulseResources } from '../shared/CloudPulseResourcesSelect';
import type { Dashboard } from '@linode/api-v4';
import type { WithStartAndEnd } from 'src/features/Longview/request.types';

export interface GlobalFilterProperties {
  handleAnyFilterChange(filters: FiltersObject): undefined | void;
}

export interface FiltersObject {
  interval: string;
  region: string;
  resource: string[];
  serviceType?: string;
  timeRange: WithStartAndEnd;
}

export const GlobalFilters = React.memo((props: GlobalFilterProperties) => {
  const [time, setTimeBox] = React.useState<WithStartAndEnd>({
    end: 0,
    start: 0,
  });

  const [selectedDashboard, setSelectedDashboard] = React.useState<
    Dashboard | undefined
  >();
  const [selectedRegion, setRegion] = React.useState<string>(); // fetch the default region from preference
  const [, setResources] = React.useState<CloudPulseResources[]>(); // removed the unused variable, this will be used later point of time

  React.useEffect(() => {
    const triggerGlobalFilterChange = () => {
      const globalFilters: FiltersObject = {
        interval: '',
        region: '',
        resource: [],
        timeRange: time,
      };
      if (selectedRegion) {
        globalFilters.region = selectedRegion;
      }
      props.handleAnyFilterChange(globalFilters);
    };
    triggerGlobalFilterChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time, selectedRegion]); // if anything changes, emit an event to parent component

  const handleTimeRangeChange = React.useCallback(
    (start: number, end: number) => {
      setTimeBox({ end, start });
    },
    []
  );

  const handleRegionChange = React.useCallback((region: string | undefined) => {
    setRegion(region);
  }, []);

  const handleResourcesSelection = React.useCallback(
    (resources: CloudPulseResources[]) => {
      setResources(resources);
    },
    []
  );

  const handleDashboardChange = React.useCallback(
    (dashboard: Dashboard | undefined, isDefault: boolean = false) => {
      setSelectedDashboard(dashboard);
      if (!isDefault) {
        // only update the region state when it is not a preference (default) call
        setRegion(undefined);
      }
    },
    []
  );

  const handleGlobalRefresh = React.useCallback(() => {}, []);

  return (
    <Grid container sx={{ ...itemSpacing, padding: '8px' }}>
      <StyledGrid xs={12}>
        <Grid sx={{ width: 300 }}>
          <CloudPulseDashboardSelect
            handleDashboardChange={handleDashboardChange}
          />
        </Grid>
        <Grid sx={{ marginLeft: 2, width: 250 }}>
          <StyledCloudPulseRegionSelect
            handleRegionChange={handleRegionChange}
            selectedDashboard={selectedDashboard}
          />
        </Grid>

        <Grid sx={{ marginLeft: 2, width: 350 }}>
          <StyledCloudPulseResourcesSelect
            handleResourcesSelection={handleResourcesSelection}
            region={selectedRegion}
            resourceType={selectedDashboard?.service_type}
          />
        </Grid>
        <Grid sx={{ marginLeft: 2, width: 250 }}>
          <StyledCloudPulseTimeRangeSelect
            handleStatsChange={handleTimeRangeChange}
            hideLabel
            label="Select Time Range"
          />
        </Grid>
        <Grid sx={{ marginLeft: -4, marginRight: 3 }}>
          <Tooltip arrow enterDelay={500} placement="top" title="Refresh">
            <IconButton onClick={handleGlobalRefresh} size="small">
              <StyledReload />
            </IconButton>
          </Tooltip>
        </Grid>
      </StyledGrid>
      <CloudPulseDashboardFilterBuilder // moving forward, every filter will be driven through filter builder component
        dashboard={selectedDashboard!}
        emitFilterChange={() => {}}
        isServiceAnalyticsIntegration={false}
      />
    </Grid>
  );
});

const StyledCloudPulseRegionSelect = styled(CloudPulseRegionSelect, {
  label: 'StyledCloudPulseRegionSelect',
})({
  width: 150,
});

const StyledCloudPulseTimeRangeSelect = styled(CloudPulseTimeRangeSelect, {
  label: 'StyledCloudPulseTimeRangeSelect',
})({
  width: 150,
});

const StyledCloudPulseResourcesSelect = styled(CloudPulseResourcesSelect, {
  label: 'StyledCloudPulseResourcesSelect',
})({
  width: 250,
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
    color: `${theme.palette.success}`,
  },
  '&:hover': {
    cursor: 'pointer',
  },
  height: '27px',
  width: '27px',
}));
