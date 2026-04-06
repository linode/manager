import { Paper } from '@linode/ui';
import { isToday as _isToday } from '@linode/utilities';
import Grid from '@mui/material/Grid';
import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';

import { TimeRangeSelect } from '../../../shared/TimeRangeSelect';
import { StyledTypography } from '../CommonStyles.styles';
import { CPUGraph } from './CPUGraph';
import { DiskGraph } from './DiskGraph';
import { LoadGraph } from './LoadGraph';
import { MemoryGraph } from './MemoryGraph';
import { NetworkGraph } from './NetworkGraph';

import type { WithStartAndEnd } from '../../../request.types';
import type { GraphProps } from './types';

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
    <Grid container sx={{ ...itemSpacing, padding: '8px' }}>
      <StyledGrid size={{ xs: 12 }}>
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
      </StyledGrid>
      <Grid sx={{ ...itemSpacing }} />
      <Grid size={12} sx={{ ...itemSpacing }}>
        <Paper
          sx={{
            marginBottom: `calc(${theme.spacing(1)} + 3px)`,
            padding: `calc(${theme.spacing(3)} + 1px)`,
          }}
        >
          <Grid
            container
            direction="row"
            spacing={4}
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Grid
              size={{
                sm: 6,
                xs: 12,
              }}
              sx={{ ...itemSpacing }}
            >
              <CPUGraph {...graphProps} />
            </Grid>
            <Grid
              size={{
                sm: 6,
                xs: 12,
              }}
              sx={{ ...itemSpacing }}
            >
              <MemoryGraph {...graphProps} />
            </Grid>
            <Grid
              size={{
                sm: 6,
                xs: 12,
              }}
              sx={{ ...itemSpacing }}
            >
              <NetworkGraph {...graphProps} />
            </Grid>
            <Grid
              size={{
                sm: 6,
                xs: 12,
              }}
              sx={{ ...itemSpacing }}
            >
              <DiskGraph {...graphProps} />
            </Grid>
            <Grid
              size={{
                sm: 6,
                xs: 12,
              }}
              sx={{ ...itemSpacing }}
            >
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

const StyledGrid = styled(Grid, { label: 'StyledGrid' })(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1.25),
  boxSizing: 'border-box',
}));

const itemSpacing = {
  boxSizing: 'border-box',
  margin: '0',
};
