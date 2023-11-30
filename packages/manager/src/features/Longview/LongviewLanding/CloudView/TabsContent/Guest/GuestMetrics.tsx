import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';

import { Paper } from 'src/components/Paper';
import { isToday as _isToday } from 'src/utilities/isToday';

import { WithStartAndEnd } from '../../../../request.types';
import { CloudViewTimeRangeSelect } from '../../shared/CloudViewTimeRange';
import { MemoryChart } from './MemoryChart';
import { useCurrentToken } from 'src/hooks/useAuthentication';
import { CloudViewLinodes } from '../../shared/CloudViewLinodes';
import { Typography } from 'src/components/Typography';
import { ErrorState } from 'src/components/ErrorState/ErrorState';

export const GuestMetrics = (props: any) => {
  const theme = useTheme();

  const [time, setTimeBox] = React.useState<WithStartAndEnd>({
    end: 0,
    start: 0,
  });

  const [linodeId, setlinodeId] = React.useState<number>();

  const [loading, setLoading] = React.useState<boolean>(false);

  const [error, setError] = React.useState<boolean>(false);

  const handleStatsChange = (start: number, end: number) => {
    setTimeBox({ end, start });
  };

  const handleLinodeChange = (linodeId: number | undefined,
    isLoading: boolean, isError: boolean) => {
    setlinodeId(linodeId);
    setLoading(isLoading);
    setError(isError);
  }

  const isToday = _isToday(time.start, time.end);

  const graphProps: any = {
    end: time.end,
    isToday,
    start: time.start,
    currentToken: useCurrentToken(),
    linodeId
  };

  return (
    <Grid container sx={{ ...itemSpacing, padding: '8px' }}>
      <StyledGrid xs={12}>
        <Grid
            sx={{
              width: 350,
            }}
          >
            <CloudViewLinodes handleLinodeChange={handleLinodeChange} />
        </Grid>
        <Grid sx={{ ...itemSpacing }}>
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
          <StyledCloudViewTimeRangeSelect
            defaultValue={'Past 30 Minutes'}
            handleStatsChange={handleStatsChange}
            hideLabel
            label="Select Time Range"
          />
        </Grid>
      </StyledGrid>
      <Grid sx={{ ...itemSpacing }} />
      <Grid sx={{ ...itemSpacing }} xs={12}>
        <Paper
          sx={{
            marginBottom: `calc(${theme.spacing(1)} + 3px)`,
            padding: `calc(${theme.spacing(3)} + 1px)`,
          }}
        >
          {error && <ErrorState 
          errorText={'Could not load linodes list'}/> 
          }

          {!loading && !error && !linodeId &&
          <Typography 
            sx={{ fontSize: '1.1em' }} 
            variant="body1" 
            align={'center'} 
            marginTop={15}
            marginBottom={15}
          >
            {'You have no Linodes configured'}
          </Typography>}

          {!loading && !error && time.start && time.end && linodeId &&
          <Grid
            alignItems="center"
            container
            direction="row"
            justifyContent="space-between"
            spacing={4}
          >
            <Grid sx={{ ...itemSpacing }} sm={12} xs={12}>
              <MemoryChart {...graphProps} />
            </Grid>
          </Grid>}
          
        </Paper>
      </Grid>
    </Grid>
  );
};

const StyledCloudViewTimeRangeSelect = styled(CloudViewTimeRangeSelect, {
  label: 'StyledCloudViewTimeRangeSelect',
})({
  width: 150,
  marginTop: 15
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
  margin: '0'
};