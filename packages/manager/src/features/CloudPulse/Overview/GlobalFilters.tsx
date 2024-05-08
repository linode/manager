import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { WithStartAndEnd } from 'src/features/Longview/request.types';

import { CloudPulseRegionSelect } from '../shared/RegionSelect';
import { CloudPulseTimeRangeSelect } from '../shared/TimeRangeSelect';

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

  const [selectedRegion, setRegion] = React.useState<string>();
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

  const handleTimeRangeChange = (start: number, end: number) => {
    setTimeBox({ end, start });
  };

  const handleRegionChange = (region: string | undefined) => {
    setRegion(region);
  };

  return (
    <Grid container sx={{ ...itemSpacing, padding: '8px' }}>
      <StyledGrid xs={12}>
        <Grid sx={{ marginLeft: 2, width: 250 }}>
          <StyledCloudPulseRegionSelect
            handleRegionChange={handleRegionChange}
          />
        </Grid>
        <Grid sx={{ marginLeft: 12, width: 250 }}>
          <StyledCloudPulseTimeRangeSelect
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
