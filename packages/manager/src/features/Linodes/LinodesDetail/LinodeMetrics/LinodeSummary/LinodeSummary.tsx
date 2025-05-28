import {
  STATS_NOT_READY_API_MESSAGE,
  STATS_NOT_READY_MESSAGE,
  useLinodeStats,
  useLinodeStatsByDate,
  useProfile,
} from '@linode/queries';
import { Autocomplete, ErrorState, Paper, Stack, Typography } from '@linode/ui';
import { formatNumber, formatPercentage, getMetrics } from '@linode/utilities';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import { DateTime } from 'luxon';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import PendingIcon from 'src/assets/icons/pending.svg';
import { AreaChart } from 'src/components/AreaChart/AreaChart';
import { setUpCharts } from 'src/utilities/charts';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { getDateOptions } from './helpers';
import { NetworkGraphs } from './NetworkGraphs';
import { StatsPanel } from './StatsPanel';

import type { ChartProps } from './NetworkGraphs';
import type { SelectOption } from '@linode/ui';
import type {
  CPUTimeData,
  DiskIOTimeData,
  Point,
} from 'src/components/AreaChart/types';

setUpCharts();

interface Props {
  linodeCreated: string;
}

const LinodeSummary = (props: Props) => {
  const { linodeCreated } = props;
  const { linodeId } = useParams<{ linodeId: string }>();
  const id = Number(linodeId);
  const theme = useTheme();

  const { data: profile } = useProfile();
  const timezone = profile?.timezone || DateTime.local().zoneName;

  const options = getDateOptions(linodeCreated);
  const [rangeSelection, setRangeSelection] = React.useState('24');
  const [year, month] = rangeSelection.split(' ');

  const isLast24Hours = rangeSelection === '24';

  const {
    data: statsData,
    error: statsError,
    isLoading: statsLoading,
  } = useLinodeStats(id, isLast24Hours);

  const {
    data: statsByDateData,
    error: statsByDateError,
    isLoading: statsByDateLoading,
  } = useLinodeStatsByDate(id, year, month, !isLast24Hours);

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

  const handleChartRangeChange = (e: SelectOption<string>) => {
    setRangeSelection(e.value);
  };

  /**
   * This changes the X-Axis tick labels depending on the selected timeframe.
   *
   * This is important because the X-Axis should show dates instead of times
   * when viewing many days' worth of stats.
   *
   * @example 'hh a' renders '11am'
   * @example 'LLL dd' renders 'Feb 14'
   */
  const xAxisTickFormat = isLast24Hours ? 'hh a' : 'LLL dd';

  const renderCPUChart = () => {
    const data = stats?.data.cpu ?? [];
    const metrics = getMetrics(data);

    const timeData = data.reduce((acc: CPUTimeData[], point: Point) => {
      acc.push({
        'CPU %': point[1],
        timestamp: point[0],
      });
      return acc;
    }, []);

    return (
      <AreaChart
        areas={[
          {
            color: theme.graphs.cpu.percent,
            dataKey: 'CPU %',
          },
        ]}
        ariaLabel="CPU Usage Graph"
        data={timeData}
        legendRows={[
          {
            data: metrics,
            format: formatPercentage,
            legendColor: theme.graphs.blue,
            legendTitle: 'CPU %',
          },
        ]}
        showLegend
        timezone={timezone}
        unit={'%'}
        xAxis={{
          tickFormat: xAxisTickFormat,
          tickGap: 60,
        }}
      />
    );
  };

  const renderDiskIOChart = () => {
    const data = {
      io: stats?.data.io.io ?? [],
      swap: stats?.data.io.swap ?? [],
    };
    const timeData: DiskIOTimeData[] = [];

    for (let i = 0; i < data.io.length; i++) {
      timeData.push({
        'I/O Rate': data.io[i][1],
        'Swap Rate': data.swap[i][1],
        timestamp: data.io[i][0],
      });
    }

    return (
      <AreaChart
        areas={[
          {
            color: theme.graphs.diskIO.read,
            dataKey: 'I/O Rate',
          },
          {
            color: theme.graphs.diskIO.swap,
            dataKey: 'Swap Rate',
          },
        ]}
        ariaLabel="Disk I/O Graph"
        data={timeData}
        legendRows={[
          {
            data: getMetrics(data.io),
            format: formatNumber,
            legendColor: theme.graphs.yellow,
            legendTitle: 'I/O Rate',
          },
          {
            data: getMetrics(data.swap),
            format: formatNumber,
            legendColor: theme.graphs.red,
            legendTitle: 'Swap Rate',
          },
        ]}
        showLegend
        timezone={timezone}
        unit={' blocks/s'}
        xAxis={{
          tickFormat: xAxisTickFormat,
          tickGap: 60,
        }}
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
          CustomIcon={PendingIcon}
          CustomIconStyles={{ height: 64, width: 64 }}
          errorText={
            <Stack spacing={1}>
              <Typography variant="h2">{STATS_NOT_READY_MESSAGE}</Typography>
              <Typography variant="body1">
                CPU, Network, and Disk stats will be available shortly
              </Typography>
            </Stack>
          }
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
    loading: isLoading,
    rangeSelection,
    timezone,
  };

  return (
    <Grid container spacing={2}>
      <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Autocomplete
          defaultValue={options[0]}
          disableClearable
          id="chartRange"
          label="Select Time Range"
          noMarginTop
          onChange={(e, value) => handleChartRangeChange(value)}
          options={options}
          sx={{ mt: 1, width: 150 }}
          textFieldProps={{
            hideLabel: true,
          }}
        />
      </Grid>
      <Grid
        size={{
          md: 6,
          xs: 12,
        }}
      >
        <Paper sx={{ height: 370 }} variant="outlined">
          <StatsPanel
            renderBody={renderCPUChart}
            title="CPU (%)"
            {...chartProps}
          />
        </Paper>
      </Grid>
      <Grid
        size={{
          md: 6,
          xs: 12,
        }}
      >
        <Paper sx={{ height: 370 }} variant="outlined">
          <StatsPanel
            renderBody={renderDiskIOChart}
            title="Disk I/O (blocks/s)"
            {...chartProps}
          />
        </Paper>
      </Grid>
      <NetworkGraphs
        stats={stats}
        xAxisTickFormat={xAxisTickFormat}
        {...chartProps}
      />
    </Grid>
  );
};

export default LinodeSummary;
