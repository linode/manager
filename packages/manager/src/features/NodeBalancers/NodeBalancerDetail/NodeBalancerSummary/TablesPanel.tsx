import * as React from 'react';
import { CircleProgress } from 'src/components/CircleProgress';
import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import LineGraph from 'src/components/LineGraph';
import MetricsDisplay from 'src/components/LineGraph/MetricsDisplay';
import getUserTimezone from 'src/utilities/getUserTimezone';
import PendingIcon from 'src/assets/icons/pending.svg';
import { formatBitsPerSecond } from 'src/features/Longview/shared/utilities';
import { useProfile } from 'src/queries/profile';
import { formatNumber, getMetrics } from 'src/utilities/statMetrics';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import {
  NODEBALANCER_STATS_NOT_READY_API_MESSAGE,
  useNodeBalancerQuery,
  useNodeBalancerStats,
} from 'src/queries/nodebalancers';
import { useParams } from 'react-router-dom';
import { Theme, useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';

const STATS_NOT_READY_TITLE =
  'Stats for this NodeBalancer are not available yet';

export const TablesPanel = () => {
  const theme = useTheme<Theme>();
  const { data: profile } = useProfile();
  const timezone = getUserTimezone(profile?.timezone);
  const { nodeBalancerId } = useParams<{ nodeBalancerId: string }>();
  const id = Number(nodeBalancerId);
  const { data: nodebalancer } = useNodeBalancerQuery(id);

  const { data: stats, isLoading, error } = useNodeBalancerStats(
    nodebalancer?.id ?? -1,
    nodebalancer?.created
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
          CustomIcon={PendingIcon}
          CustomIconStyles={{ width: 64, height: 64 }}
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

    return (
      <React.Fragment>
        <StyledChart>
          <LineGraph
            ariaLabel="Connections Graph"
            timezone={timezone}
            showToday={true}
            accessibleDataTable={{ unit: 'CXN/s' }}
            data={[
              {
                label: 'Connections',
                borderColor: 'transparent',
                backgroundColor: theme.graphs.purple,
                data,
              },
            ]}
          />
        </StyledChart>
        <StyledBottomLegend>
          <MetricsDisplay
            rows={[
              {
                legendTitle: 'Connections',
                legendColor: 'purple',
                data: metrics,
                format: formatNumber,
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
          CustomIcon={PendingIcon}
          CustomIconStyles={{ width: 64, height: 64 }}
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
            ariaLabel="Traffic Graph"
            timezone={timezone}
            showToday={true}
            accessibleDataTable={{ unit: 'bits/s' }}
            data={[
              {
                label: 'Traffic In',
                borderColor: 'transparent',
                backgroundColor: theme.graphs.network.inbound,
                data: trafficIn,
              },
              {
                label: 'Traffic Out',
                borderColor: 'transparent',
                backgroundColor: theme.graphs.network.outbound,
                data: trafficOut,
              },
            ]}
          />
        </StyledChart>
        <StyledBottomLegend>
          <MetricsDisplay
            rows={[
              {
                legendTitle: 'Inbound',
                legendColor: 'darkGreen',
                data: getMetrics(trafficIn),
                format: formatBitsPerSecond,
              },
              {
                legendTitle: 'Outbound',
                legendColor: 'lightGreen',
                data: getMetrics(trafficOut),
                format: formatBitsPerSecond,
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
  position: 'relative',
  width: '100%',
  paddingLeft: theme.spacing(1),
}));

const StyledBottomLegend = styled('div', {
  label: 'StyledBottomLegend',
})(({ theme }) => ({
  margin: `${theme.spacing(2)} ${theme.spacing(1)} ${theme.spacing(1)}`,
  padding: 10,
  color: '#777',
  backgroundColor: theme.bg.offWhite,
  border: `1px solid ${theme.color.border3}`,
  fontSize: 14,
}));

const StyledgGraphControls = styled(Typography, {
  label: 'StyledgGraphControls',
})(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  [theme.breakpoints.up('md')]: {
    margin: `${theme.spacing(2)} 0`,
  },
}));

const StyledPanel = styled(Paper, {
  label: 'StyledPanel',
})(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const StyledEmptyText = styled(Typography, {
  label: 'StyledEmptyText',
})(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(),
}));

const Loading = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 300,
    }}
  >
    <CircleProgress mini />
  </div>
);
