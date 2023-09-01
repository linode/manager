import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';

import { Paper } from 'src/components/Paper';
import { isToday as _isToday } from 'src/utilities/isToday';

import { WithStartAndEnd } from '../../../request.types';
import { TimeRangeSelect } from '../../../shared/TimeRangeSelect';

import { StyledTypography } from '../CommonStyles.styles';
import { CPUGraph } from './CPUGraph';
import { DiskGraph } from './DiskGraph';
import { LoadGraph } from './LoadGraph';
import { MemoryGraph } from './MemoryGraph';
import { NetworkGraph } from './NetworkGraph';
import { GraphProps } from './types';

interface Props {
  clientAPIKey: string;
  lastUpdated?: number;
  lastUpdatedError: boolean;
  timezone: string;
}

export const OverviewGraphs = (props: Props) => {
  const theme = useTheme();

  const { clientAPIKey, lastUpdated, lastUpdatedError, timezone } = props;

  const [time, setTimeBox] = React.useState<WithStartAndEnd>({
    end: 0,
    start: 0,
  });

  const handleStatsChange = (start: number, end: number) => {
    setTimeBox({ end, start });
  };

  const isToday = _isToday(time.start, time.end);

  const graphProps: GraphProps = {
    clientAPIKey,
    end: time.end,
    isToday,
    lastUpdated,
    lastUpdatedError,
    start: time.start,
    timezone,
  };

  return (
    <Grid sx={{ ...itemSpacing, padding: '8px' }}>
      <Grid
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: theme.spacing(1.25),
          boxSizing: 'border-box',
        }}
      >
        <Grid sx={{ ...itemSpacing }}>
          <StyledTypography variant="h2">
            Resource Allocation History
          </StyledTypography>
        </Grid>
        <Grid
          sx={{
            ...itemSpacing,
            [theme.breakpoints.down('lg')]: {
              marginLeft: theme.spacing(),
              marginRight: theme.spacing(),
            },
          }}
        >
          <StyledTimeRangeSelect
            defaultValue={'Past 30 Minutes'}
            handleStatsChange={handleStatsChange}
            hideLabel
            label="Select Time Range"
          />
        </Grid>
      </Grid>
      <Grid sx={{ ...itemSpacing }} />
      <Grid sx={{ ...itemSpacing }} xs={12}>
        <Paper
          sx={{
            marginBottom: `calc(${theme.spacing(1)} + 3px)`,
            padding: `calc(${theme.spacing(3)} + 1px)`,
          }}
        >
          <Grid
            alignItems="center"
            container
            direction="row"
            justifyContent="space-between"
            spacing={4}
          >
            <Grid sx={{ ...itemSpacing }} sm={6} xs={12}>
              <CPUGraph {...graphProps} />
            </Grid>
            <Grid sx={{ ...itemSpacing }} sm={6} xs={12}>
              <MemoryGraph {...graphProps} />
            </Grid>
            <Grid sx={{ ...itemSpacing }} sm={6} xs={12}>
              <NetworkGraph {...graphProps} />
            </Grid>
            <Grid sx={{ ...itemSpacing }} sm={6} xs={12}>
              <DiskGraph {...graphProps} />
            </Grid>
            <Grid sx={{ ...itemSpacing }} sm={6} xs={12}>
              <LoadGraph {...graphProps} />
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

const StyledTimeRangeSelect = styled(TimeRangeSelect, {
  label: 'StyledTimeRangeSelect',
})({
  width: 150,
});

const itemSpacing = {
  boxSizing: 'border-box',
  margin: '0',
};
