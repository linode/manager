/* eslint-disable no-console */
import { Dashboard, TimeDuration, TimeGranularity } from '@linode/api-v4';
import { styled, useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

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
import { CloudViewTimeRangeSelect } from '../shared/TimeRangeSelect';

export const GlobalFilters = React.memo((props: GlobalFilterProperties) => {
  const [time, setTimeBox] = React.useState<WithStartAndEnd>({
    end: 0,
    start: 0,
  });

  const [selectedInterval, setInterval] = React.useState<string>();

  const [apiGranularity, setApiGranularity] = React.useState<TimeGranularity>();

  const [apiTimeDuration, setApiTimeDuration] = React.useState<TimeDuration>();

  const [selectedRegion, setRegion] = React.useState<string>();

  const [selectedResourceId, setResourceId] = React.useState<any>();

  const [selectedDashboard, setDashboard] = React.useState<
    Dashboard | undefined
  >();

  const [
    selectedService,
    setService,
  ] = React.useState<CloudViewResourceTypes>();

  const emitGlobalFilterChange = () => {
    const globalFilters = {} as FiltersObject;
    globalFilters.region = selectedRegion!;
    globalFilters.interval = selectedInterval!;
    globalFilters.resource = selectedResourceId;
    globalFilters.serviceType = selectedService!;
    globalFilters.timeRange = time;
    globalFilters.step = apiGranularity;
    globalFilters.duration = apiTimeDuration;
    props.handleAnyFilterChange(globalFilters);
  };

  React.useEffect(() => {
    emitGlobalFilterChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    time,
    selectedRegion,
    selectedResourceId,
    selectedService,
    apiGranularity,
  ]); // if anything changes, emit an event to parent component

  React.useEffect(() => {
    props.handleDashboardChange(selectedDashboard!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDashboard]); // if anything changes, emit an event to parent component

  const handleTimeRangeChange = (
    start: number,
    end: number,
    timeDuration?: TimeDuration
  ) => {
    console.log('TimeRange: ', start, end);
    setTimeBox({ end, start });
    if (timeDuration) {
      setApiTimeDuration(timeDuration);
    }
  };

  const handleIntervalChange = (interval: string | undefined) => {
    console.log('Interval: ', interval);
    setInterval(interval);
    convertIntervalToGranularity(interval);
  };

  const handleRegionChange = (region: string | undefined) => {
    console.log('Region: ', region);
    setRegion(region);
  };

  const handleResourceChange = (resourceId: any[]) => {
    console.log('Resource ID: ', resourceId);
    setResourceId(resourceId.map((obj) => obj.label));
  };

  const handleDashboardChange = (dashboard: Dashboard | undefined) => {
    console.log('Selected Dashboard: ', dashboard);
    setDashboard(dashboard);
    setService(dashboard?.service_type);
  };

  const convertIntervalToGranularity = (interval: string | undefined) => {
    if (interval == undefined) {
      return;
    }
    if (interval == '1m' || interval == '1minute') {
      setApiGranularity({ unit: 'min', value: 1 });
    }

    if (interval == '5minute') {
      setApiGranularity({ unit: 'min', value: 5 });
    }

    if (interval == '2hour') {
      setApiGranularity({ unit: 'hr', value: 2 });
    }

    if (interval == '1day') {
      setApiGranularity({ unit: 'day', value: 1 });
    }
  };

  return (
    <Grid container sx={{ ...itemSpacing, padding: '8px' }}>
      <StyledGrid xs={12}>
        <Grid sx={{ width: 300 }}>
          <CloudViewDashboardSelect
            handleDashboardChange={handleDashboardChange}
          />
        </Grid>
        <Grid sx={{ marginLeft: 2, width: 200 }}>
          <StyledCloudViewRegionSelect
            handleRegionChange={handleRegionChange}
          />
        </Grid>
        <Grid sx={{ marginLeft: 3, width: 250 }}>
          <StyledCloudViewResourceSelect
            disabled={!selectedService}
            handleResourceChange={handleResourceChange}
            region={selectedRegion}
            resourceType={selectedService}
          />
        </Grid>
        <Grid sx={{ marginLeft: 5 }}>
          <StyledCloudViewIntervalSelect
            handleIntervalChange={handleIntervalChange}
          />
        </Grid>
        <Grid sx={{ marginLeft: 12, width: 250 }}>
          <StyledCloudViewTimeRangeSelect
            defaultValue={'Past 30 Minutes'}
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
  width: 100,
});

const StyledCloudViewTimeRangeSelect = styled(CloudViewTimeRangeSelect, {
  label: 'StyledCloudViewTimeRangeSelect',
})({
  width: 150,
});

const StyledCloudViewIntervalSelect = styled(CloudViewIntervalSelect, {
  label: 'StyledCloudViewIntervalSelect',
})({
  marginRight: 10,
  width: 40,
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
