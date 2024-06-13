import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import PendingIcon from 'src/assets/icons/pending.svg';
import { AreaChart } from 'src/components/AreaChart/AreaChart';
import { Box } from 'src/components/Box';
import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { formatBitsPerSecond } from 'src/features/Longview/shared/utilities';
import {
  useNodeBalancerQuery,
  useNodeBalancerStatsQuery,
} from 'src/queries/nodebalancers';
import { useProfile } from 'src/queries/profile/profile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getUserTimezone } from 'src/utilities/getUserTimezone';
import { formatNumber, getMetrics } from 'src/utilities/statMetrics';

import type { Theme } from '@mui/material/styles';
import type {
  NodeBalancerConnectionsTimeData,
  Point,
} from 'src/components/AreaChart/types';

const NODEBALANCER_STATS_NOT_READY_API_MESSAGE =
  'Stats are unavailable at this time.';
const STATS_NOT_READY_TITLE =
  'Stats for this NodeBalancer are not available yet';

export const TablesPanel = () => {
  const theme = useTheme<Theme>();
  const { data: profile } = useProfile();
  const timezone = getUserTimezone(profile?.timezone);
  const { nodeBalancerId } = useParams<{ nodeBalancerId: string }>();
  const id = Number(nodeBalancerId);
  const { data: nodebalancer } = useNodeBalancerQuery(id);

  const { data: stats, error, isLoading } = useNodeBalancerStatsQuery(
    nodebalancer?.id ?? -1
  );

  const statsErrorString = error
    ? getAPIErrorOrDefault(error, 'Unable to load stats')[0].reason
    : undefined;

  const statsNotReadyError =
    statsErrorString === NODEBALANCER_STATS_NOT_READY_API_MESSAGE;

  const renderConnectionsChart = () => {
    const data = stats?.data.connections ?? [];

    if (statsNotReadyError) {
      return (
        <ErrorState
          errorText={
            <>
              <div>
                <StyledEmptyText variant="h2">
                  {STATS_NOT_READY_TITLE}
                </StyledEmptyText>
              </div>
              <div>
                <StyledEmptyText variant="body1">
                  Connection stats will be available shortly
                </StyledEmptyText>
              </div>
            </>
          }
          CustomIcon={PendingIcon}
          CustomIconStyles={{ height: 64, width: 64 }}
        />
      );
    }

    if (statsErrorString && !statsNotReadyError) {
      return <ErrorState errorText={statsErrorString} />;
    }

    if (isLoading) {
      return <Loading />;
    }

    const metrics = getMetrics(data);

    const timeData = data.reduce(
      (acc: NodeBalancerConnectionsTimeData[], point: Point) => {
        acc.push({
          Connections: point[1],
          timestamp: point[0],
        });
        return acc;
      },
      []
    );

    return (
      <Box marginLeft={-3}>
        <AreaChart
          areas={[
            {
              color: theme.graphs.purple,
              dataKey: 'Connections',
            },
          ]}
          legendRows={[
            {
              data: metrics,
              format: formatNumber,
              legendColor: 'purple',
              legendTitle: 'Connections',
            },
          ]}
          xAxis={{
            tickFormat: 'hh a',
            tickGap: 60,
          }}
          ariaLabel="Connections Graph"
          data={timeData}
          height={412}
          showLegend
          timezone={timezone}
          unit={' CXN/s'}
        />
      </Box>
    );
  };

  const renderTrafficChart = () => {
    const trafficIn = stats?.data.traffic.in ?? [];
    const trafficOut = stats?.data.traffic.out ?? [];
    const timeData = [];

    if (trafficIn) {
      for (let i = 0; i < trafficIn.length; i++) {
        timeData.push({
          'Traffic In': trafficIn[i][1],
          'Traffic Out': trafficOut[i][1],
          timestamp: trafficIn[i][0],
        });
      }
    }

    if (statsNotReadyError) {
      return (
        <ErrorState
          errorText={
            <>
              <div>
                <StyledEmptyText variant="h2">
                  {STATS_NOT_READY_TITLE}
                </StyledEmptyText>
              </div>
              <div>
                <StyledEmptyText variant="body1">
                  Traffic stats will be available shortly
                </StyledEmptyText>
              </div>
            </>
          }
          CustomIcon={PendingIcon}
          CustomIconStyles={{ height: 64, width: 64 }}
        />
      );
    }

    if (statsErrorString && !statsNotReadyError) {
      return <ErrorState errorText={statsErrorString} />;
    }

    if (isLoading) {
      return <Loading />;
    }

    return (
      <Box marginLeft={-3}>
        <AreaChart
          areas={[
            {
              color: theme.graphs.darkGreen,
              dataKey: 'Traffic In',
            },
            {
              color: theme.graphs.lightGreen,
              dataKey: 'Traffic Out',
            },
          ]}
          legendRows={[
            {
              data: getMetrics(trafficIn),
              format: formatBitsPerSecond,
              legendColor: 'darkGreen',
              legendTitle: 'Traffic In',
            },
            {
              data: getMetrics(trafficOut),
              format: formatBitsPerSecond,
              legendColor: 'lightGreen',
              legendTitle: 'Traffic Out',
            },
          ]}
          xAxis={{
            tickFormat: 'hh a',
            tickGap: 60,
          }}
          ariaLabel="Network Traffic Graph"
          data={timeData}
          height={412}
          showLegend
          timezone={timezone}
          unit={' bits/s'}
        />
      </Box>
    );
  };

  return (
    <React.Fragment>
      <StyledTitle variant="h2">Graphs</StyledTitle>
      <StyledPanel>
        <StyledHeader variant="h3">
          Connections (CXN/s, 5 min avg.)
        </StyledHeader>
        {renderConnectionsChart()}
      </StyledPanel>
      <StyledPanel>
        <StyledHeader variant="h3">Traffic (bits/s, 5 min avg.)</StyledHeader>
        {renderTrafficChart()}
      </StyledPanel>
    </React.Fragment>
  );
};

const StyledHeader = styled(Typography, {
  label: 'StyledHeader',
})(({ theme }) => ({
  padding: theme.spacing(2),
}));

const StyledTitle = styled(Typography, {
  label: 'StyledTitle',
})(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  [theme.breakpoints.down('lg')]: {
    marginLeft: theme.spacing(),
  },
  [theme.breakpoints.up('md')]: {
    margin: `${theme.spacing(2)} 0`,
  },
}));

export const StyledBottomLegend = styled('div', {
  label: 'StyledBottomLegend',
})(({ theme }) => ({
  backgroundColor: theme.bg.offWhite,
  color: '#777',
  fontSize: 14,
  margin: `${theme.spacing(2)} ${theme.spacing(1)} ${theme.spacing(1)}`,
}));

const StyledPanel = styled(Paper, {
  label: 'StyledPanel',
})(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
}));

const StyledEmptyText = styled(Typography, {
  label: 'StyledEmptyText',
})(({ theme }) => ({
  marginTop: theme.spacing(),
  textAlign: 'center',
}));

const Loading = () => (
  <div
    style={{
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center',
      minHeight: 300,
    }}
  >
    <CircleProgress size="sm" />
  </div>
);
