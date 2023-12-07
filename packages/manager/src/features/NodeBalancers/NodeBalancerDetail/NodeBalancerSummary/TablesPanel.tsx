import { styled } from '@mui/material/styles';
import { Theme, useTheme } from '@mui/material/styles';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import PendingIcon from 'src/assets/icons/pending.svg';
import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LineGraph } from 'src/components/LineGraph/LineGraph';
import MetricsDisplay from 'src/components/LineGraph/MetricsDisplay';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { formatBitsPerSecond } from 'src/features/Longview/shared/utilities';
import { useFlags } from 'src/hooks/useFlags';
import {
  NODEBALANCER_STATS_NOT_READY_API_MESSAGE,
  useNodeBalancerQuery,
  useNodeBalancerStats,
} from 'src/queries/nodebalancers';
import { useProfile } from 'src/queries/profile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getUserTimezone } from 'src/utilities/getUserTimezone';
import { formatNumber, getMetrics } from 'src/utilities/statMetrics';

import { NodeBalancerConnectionsChart } from './NodeBalancerConnectionsChart';

const STATS_NOT_READY_TITLE =
  'Stats for this NodeBalancer are not available yet';

export const TablesPanel = () => {
  const theme = useTheme<Theme>();
  const { data: profile } = useProfile();
  const timezone = getUserTimezone(profile?.timezone);
  const { nodeBalancerId } = useParams<{ nodeBalancerId: string }>();
  const id = Number(nodeBalancerId);
  const { data: nodebalancer } = useNodeBalancerQuery(id);

  const { data: stats, error, isLoading } = useNodeBalancerStats(
    nodebalancer?.id ?? -1,
    nodebalancer?.created
  );

  const flags = useFlags();

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

    const timeData = data.reduce((acc: any, point: any) => {
      acc.push({
        Connections: point[1],
        t: point[0],
      });
      return acc;
    }, []);

    return (
      <React.Fragment>
        {flags.recharts ? (
          <NodeBalancerConnectionsChart
            aria-label={'Connections Graph'}
            data={timeData}
            timezone={timezone}
            unit={'CXN'}
          />
        ) : (
          <StyledChart>
            <LineGraph
              data={[
                {
                  backgroundColor: theme.graphs.purple,
                  borderColor: 'transparent',
                  data,
                  label: 'Connections',
                },
              ]}
              accessibleDataTable={{ unit: 'CXN/s' }}
              ariaLabel="Connections Graph"
              showToday={true}
              timezone={timezone}
            />
          </StyledChart>
        )}
        <StyledBottomLegend>
          <MetricsDisplay
            rows={[
              {
                data: metrics,
                format: formatNumber,
                legendColor: 'purple',
                legendTitle: 'Connections',
              },
            ]}
          />
        </StyledBottomLegend>
      </React.Fragment>
    );
  };

  const renderTrafficChart = () => {
    const trafficIn = stats?.data.traffic.in ?? [];
    const trafficOut = stats?.data.traffic.out ?? [];

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
      <React.Fragment>
        <StyledChart>
          <LineGraph
            data={[
              {
                backgroundColor: theme.graphs.network.inbound,
                borderColor: 'transparent',
                data: trafficIn,
                label: 'Traffic In',
              },
              {
                backgroundColor: theme.graphs.network.outbound,
                borderColor: 'transparent',
                data: trafficOut,
                label: 'Traffic Out',
              },
            ]}
            accessibleDataTable={{ unit: 'bits/s' }}
            ariaLabel="Traffic Graph"
            showToday={true}
            timezone={timezone}
          />
        </StyledChart>
        <StyledBottomLegend>
          <MetricsDisplay
            rows={[
              {
                data: getMetrics(trafficIn),
                format: formatBitsPerSecond,
                legendColor: 'darkGreen',
                legendTitle: 'Inbound',
              },
              {
                data: getMetrics(trafficOut),
                format: formatBitsPerSecond,
                legendColor: 'lightGreen',
                legendTitle: 'Outbound',
              },
            ]}
          />
        </StyledBottomLegend>
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      <StyledgGraphControls>
        <StyledTitle variant="h2">Graphs</StyledTitle>
      </StyledgGraphControls>
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
  [theme.breakpoints.down('lg')]: {
    marginLeft: theme.spacing(),
  },
}));

const StyledChart = styled('div', {
  label: 'StyledChart',
})(({ theme }) => ({
  paddingLeft: theme.spacing(1),
  position: 'relative',
  width: '100%',
}));

const StyledBottomLegend = styled('div', {
  label: 'StyledBottomLegend',
})(({ theme }) => ({
  backgroundColor: theme.bg.offWhite,
  border: `1px solid ${theme.color.border3}`,
  color: '#777',
  fontSize: 14,
  margin: `${theme.spacing(2)} ${theme.spacing(1)} ${theme.spacing(1)}`,
  padding: 10,
}));

const StyledgGraphControls = styled(Typography, {
  label: 'StyledgGraphControls',
})(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  [theme.breakpoints.up('md')]: {
    margin: `${theme.spacing(2)} 0`,
  },
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
    <CircleProgress mini />
  </div>
);
