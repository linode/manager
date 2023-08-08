import Grid from '@mui/material/Unstable_Grid2';
import { styled, useTheme } from '@mui/material/styles';
import { DateTime } from 'luxon';
import * as React from 'react';
import { useParams } from 'react-router-dom';
import { debounce } from 'throttle-debounce';

import PendingIcon from 'src/assets/icons/pending.svg';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LineGraph } from 'src/components/LineGraph/LineGraph';
import { Typography } from 'src/components/Typography';
import { Paper } from 'src/components/Paper';
import { useWindowDimensions } from 'src/hooks/useWindowDimensions';
import {
  STATS_NOT_READY_API_MESSAGE,
  STATS_NOT_READY_MESSAGE,
  useLinodeStats,
  useLinodeStatsByDate,
} from 'src/queries/linodes/stats';
import { useProfile } from 'src/queries/profile';
import { setUpCharts } from 'src/utilities/charts';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import {
  formatNumber,
  formatPercentage,
  getMetrics,
} from 'src/utilities/statMetrics';

import { NetworkGraphs } from './NetworkGraphs';
import type { ChartProps } from './NetworkGraphs';
import { StatsPanel } from './StatsPanel';
import { getDateOptions } from './helpers';

setUpCharts();

interface Props {
  isBareMetalInstance: boolean;
  linodeCreated: string;
}

const chartHeight = 160;

const LinodeSummary: React.FC<Props> = (props) => {
  const { isBareMetalInstance, linodeCreated } = props;
  const { linodeId } = useParams<{ linodeId: string }>();
  const id = Number(linodeId);
  const theme = useTheme();

  const { data: profile } = useProfile();
  const timezone = profile?.timezone || DateTime.local().zoneName;

  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  const options = getDateOptions(linodeCreated);
  const [rangeSelection, setRangeSelection] = React.useState('24');
  const [year, month] = rangeSelection.split(' ');

  const isLast24Hours = rangeSelection === '24';

  const {
    data: statsData,
    error: statsError,
    isLoading: statsLoading,
    refetch: refetchLinodeStats,
  } = useLinodeStats(id, isLast24Hours, linodeCreated);

  const {
    data: statsByDateData,
    error: statsByDateError,
    isLoading: statsByDateLoading,
  } = useLinodeStatsByDate(id, year, month, !isLast24Hours, linodeCreated);

  const stats = isLast24Hours ? statsData : statsByDateData;
  const isLoading = isLast24Hours ? statsLoading : statsByDateLoading;
  const error = isLast24Hours ? statsError : statsByDateError;

  const statsErrorString = error
    ? getAPIErrorOrDefault(error, 'An error occurred while getting stats.')[0]
        .reason
    : undefined;

  const areStatsNotReady =
    statsErrorString &&
    [STATS_NOT_READY_API_MESSAGE, STATS_NOT_READY_MESSAGE].includes(
      statsErrorString
    );

  const handleChartRangeChange = (e: Item<string>) => {
    setRangeSelection(e.value);
  };

  /*
    We create a debounced function to refetch Linode stats that will run 1.5 seconds after the window is resized.
    This makes the graphs adjust sooner than their typical 30-second interval.
  */
  const debouncedRefetchLinodeStats = React.useRef(
    debounce(1500, false, () => {
      refetchLinodeStats();
    })
  ).current;

  React.useEffect(() => {
    debouncedRefetchLinodeStats();
  }, [windowWidth, windowHeight, debouncedRefetchLinodeStats]);

  const renderCPUChart = () => {
    const data = stats?.data.cpu ?? [];

    const metrics = getMetrics(data);

    return (
      <LineGraph
        data={[
          {
            backgroundColor: theme.graphs.cpu.percent,
            borderColor: 'transparent',
            data,
            label: 'CPU %',
          },
        ]}
        legendRows={[
          {
            data: metrics,
            format: formatPercentage,
            legendColor: 'blue',
            legendTitle: 'CPU %',
          },
        ]}
        accessibleDataTable={{ unit: '%' }}
        ariaLabel="CPU Usage Graph"
        chartHeight={chartHeight}
        showToday={rangeSelection === '24'}
        timezone={timezone}
      />
    );
  };

  const renderDiskIOChart = () => {
    const data = {
      io: stats?.data.io.io ?? [],
      swap: stats?.data.io.swap ?? [],
    };

    return (
      <LineGraph
        data={[
          {
            backgroundColor: theme.graphs.diskIO.read,
            borderColor: 'transparent',
            data: data.io,
            label: 'I/O Rate',
          },
          {
            backgroundColor: theme.graphs.diskIO.swap,
            borderColor: 'transparent',
            data: data.swap,
            label: 'Swap Rate',
          },
        ]}
        legendRows={[
          {
            data: getMetrics(data.io),
            format: formatNumber,
          },
          {
            data: getMetrics(data.swap),
            format: formatNumber,
          },
        ]}
        accessibleDataTable={{ unit: 'blocks/s' }}
        ariaLabel="Disk I/O Graph"
        chartHeight={chartHeight}
        showToday={rangeSelection === '24'}
        timezone={timezone}
      />
    );
  };

  if (!linodeId) {
    return null;
  }

  if (areStatsNotReady) {
    return (
      <Paper>
        <ErrorState
          errorText={
            <>
              <div>
                <StyledTypography variant="h2">
                  {STATS_NOT_READY_MESSAGE}
                </StyledTypography>
              </div>
              <div>
                <StyledTypography variant="body1">
                  CPU, Network, and Disk stats will be available shortly
                </StyledTypography>
              </div>
            </>
          }
          CustomIcon={PendingIcon}
          CustomIconStyles={{ height: 64, width: 64 }}
        />
      </Paper>
    );
  }

  if (statsErrorString && !areStatsNotReady) {
    return (
      <Paper>
        <ErrorState
          CustomIconStyles={{ height: 64, width: 64 }}
          errorText={statsErrorString}
        />
      </Paper>
    );
  }

  const chartProps: ChartProps = {
    height: chartHeight,
    loading: isLoading,
    rangeSelection,
    timezone,
  };

  return (
    <Paper>
      <Grid sx={{ width: '100%', margin: 0 }} container>
        <Grid
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: theme.spacing(),
            padding: 0,
          }}
          xs={12}
        >
          <StyledSelect
            defaultValue={options[0]}
            hideLabel
            id="chartRange"
            isClearable={false}
            label="Select Time Range"
            name="chartRange"
            onChange={handleChartRangeChange}
            options={options}
            small
          />
        </Grid>
        {!isBareMetalInstance ? (
          <Grid
            sx={{
              flexWrap: 'nowrap',
              margin: 0,
              [theme.breakpoints.down(1100)]: {
                flexWrap: 'wrap',
              },
            }}
            container
            spacing={4}
            xs={12}
          >
            <StyledGrid xs={12}>
              <StatsPanel
                renderBody={renderCPUChart}
                title="CPU (%)"
                {...chartProps}
              />
            </StyledGrid>
            <StyledGrid xs={12}>
              <StatsPanel
                renderBody={renderDiskIOChart}
                title="Disk I/O (blocks/s)"
                {...chartProps}
              />
            </StyledGrid>
          </Grid>
        ) : null}
        <NetworkGraphs stats={stats} {...chartProps} />
      </Grid>
    </Paper>
  );
};

const StyledSelect = styled(Select, { label: 'StyledSelect' })({
  maxWidth: 150,
});

const StyledGrid = styled(Grid, { label: 'StyledGrid' })(({ theme }) => ({
  '& h2': {
    fontSize: '1rem',
  },
  '&.MuiGrid-item': {
    padding: theme.spacing(2),
  },
  backgroundColor: theme.bg.offWhite,
  border: `solid 1px ${theme.borderColors.divider}`,
  marginBottom: theme.spacing(2),
  [theme.breakpoints.up(1100)]: {
    '&:first-of-type': {
      marginRight: theme.spacing(2),
    },
  },
}));

const StyledTypography = styled(Typography, { label: 'StyledTypography' })(
  ({ theme }) => ({
    marginTop: theme.spacing(),
    textAlign: 'center',
  })
);

export default LinodeSummary;
