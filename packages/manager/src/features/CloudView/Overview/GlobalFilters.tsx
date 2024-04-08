/* eslint-disable no-console */
import { styled, useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { WithStartAndEnd } from 'src/features/Longview/request.types';

import {
  FiltersObject,
  GlobalFilterProperties,
} from '../Models/GlobalFilterProperties';
import { CloudViewIntervalSelect } from '../shared/IntervalSelect';
import { CloudViewRegionSelect } from '../shared/RegionSelect';
import {
  CloudViewResourceSelect,
  CloudViewResourceTypes,
} from '../shared/ResourceSelect';
import { CloudViewServiceSelect } from '../shared/ServicetypeSelect';
import { CloudViewTimeRangeSelect } from '../shared/TimeRangeSelect';

export const GlobalFilters = React.memo((props: GlobalFilterProperties) => {
  const [time, setTimeBox] = React.useState<WithStartAndEnd>({
    end: 0,
    start: 0,
  });

  const [selectedInterval, setInterval] = React.useState<string>();

  const [selectedRegion, setRegion] = React.useState<string>();

  const [selectedResourceId, setResourceId] = React.useState<any>();

  const [
    selectedService,
    setService,
  ] = React.useState<CloudViewResourceTypes>();

  React.useEffect(() => {
    emitGlobalFilterChange();
  }, [
    time,
    selectedInterval,
    selectedRegion,
    selectedResourceId,
    selectedService,
  ]); // if anything changes, emit an event to parent component

  const handleTimeRangeChange = (start: number, end: number) => {
    console.log('TimeRange: ', start, end);
    setTimeBox({ end, start });
  };

  const handleIntervalChange = (interval: string | undefined) => {
    console.log('Interval: ', interval);
    setInterval(interval);
  };

  const handleRegionChange = (region: string | undefined) => {
    console.log('Region: ', region);
    setRegion(region);
  };

  const handleResourceChange = (resourceId: any) => {
    console.log('Resource ID: ', resourceId);
    setResourceId(resourceId);
  };

  const handleServiceChange = (service: CloudViewResourceTypes) => {
    console.log('Service Type: ', service);
    setService(service);
  };

  const emitGlobalFilterChange = () => {
    const globalFilters = {} as FiltersObject;
    globalFilters.region = selectedRegion!;
    globalFilters.interval = selectedInterval!;
    globalFilters.resource = selectedResourceId;
    globalFilters.serviceType = selectedService!;
    globalFilters.timeRange = time;

    if(selectedInterval) {
      globalFilters.step = {
        unit: selectedInterval.substring(1)!,
        // eslint-disable-next-line radix
        value: parseInt(selectedInterval.charAt(0)!),
      };
    }    
    props.handleAnyFilterChange(globalFilters);
  };

  return (
    <Grid container sx={{ ...itemSpacing, padding: '8px' }}>
      <StyledGrid xs={12}>
        <Grid sx={{ marginLeft: 2, width: 200 }}>
          <StyledCloudViewRegionSelect
            handleRegionChange={handleRegionChange}
          />
        </Grid>
        <Grid sx={{ marginLeft: 2, width: 200 }}>
          <CloudViewServiceSelect handleServiceChange={handleServiceChange} />
        </Grid>
        <Grid sx={{ marginLeft: 3, width: 200 }}>
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
        <Grid sx={{ marginLeft: 3 }}>
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

const StyledCloudViewResourceSelect = styled(CloudViewResourceSelect, {
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
