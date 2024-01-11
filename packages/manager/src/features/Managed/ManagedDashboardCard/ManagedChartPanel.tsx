import { DataSeries, ManagedStatsData } from '@linode/api-v4/lib/managed';
import { useTheme } from '@mui/material/styles';
import { Theme } from '@mui/material/styles';
import * as React from 'react';

import { AreaChart } from 'src/components/AreaChart/AreaChart';
import { Box } from 'src/components/Box';
import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LineGraph } from 'src/components/LineGraph/LineGraph';
import { TabbedPanel } from 'src/components/TabbedPanel/TabbedPanel';
import { Typography } from 'src/components/Typography';
import { FlagSet } from 'src/featureFlags';
import {
  convertNetworkToUnit,
  formatNetworkTooltip,
  generateNetworkUnits,
} from 'src/features/Longview/shared/utilities';
import { useFlags } from 'src/hooks/useFlags';
import { useManagedStatsQuery } from 'src/queries/managed/managed';
import { useProfile } from 'src/queries/profile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getUserTimezone } from 'src/utilities/getUserTimezone';

import {
  StyledCanvasContainerDiv,
  StyledGraphControlsDiv,
  StyledRootDiv,
} from './ManagedChartPanel.styles';

const chartHeight = 300;

interface NetworkTransferProps {
  'Network Traffic In': number;
  'Network Traffic Out': number;
  timestamp: number;
}

// @TODO recharts remove old format function
const formatData = (value: DataSeries[]): [number, number][] =>
  value.map((thisPoint) => [thisPoint.x, thisPoint.y]);

const formatData2 = (value: DataSeries[], label: string) =>
  value.map((thisPoint) => ({ [label]: thisPoint.y, timestamp: thisPoint.x }));

const _formatTooltip = (valueInBytes: number) =>
  formatNetworkTooltip(valueInBytes / 8);

const createTabs = (
  data: ManagedStatsData | undefined,
  timezone: string,
  theme: Theme,
  flags: FlagSet
) => {
  const summaryCopy = (
    <Typography variant="body1">
      This graph represents combined usage for all Linodes on this account.
    </Typography>
  );
  if (!data) {
    return [];
  }

  const formattedNetIn = data.net_in.map((dataPoint) => dataPoint.y);
  const formattedNetOut = data.net_out.map((dataPoint) => dataPoint.y);
  const netInMax = Math.max(...formattedNetIn);
  const netOutMax = Math.max(...formattedNetOut);

  // Find the max and convert to bytes, which is what generateNetworkUnits
  // expects.
  const maxNetworkInBytes = Math.max(netInMax, netOutMax) / 8;
  const unit = generateNetworkUnits(maxNetworkInBytes);

  const convertNetworkData = (value: number) => {
    return convertNetworkToUnit(value, unit as any);
  };

  const networkTransferData: NetworkTransferProps[] = [];
  // @TODO recharts: remove conditional code and delete old chart when we decide recharts is stable
  if (flags.recharts) {
    for (let i = 0; i < data.net_in.length; i++) {
      networkTransferData.push({
        'Network Traffic In': convertNetworkData(data.net_in[i].y),
        'Network Traffic Out': convertNetworkData(data.net_out[i].y),
        timestamp: data.net_in[i].x,
      });
    }
  }

  // @TODO recharts: remove conditional code and delete old chart when we decide recharts is stable
  return [
    {
      render: () => {
        return (
          <StyledRootDiv>
            <div>{summaryCopy}</div>
            {flags.recharts ? (
              <Box marginLeft={-4} marginTop={3}>
                <AreaChart
                  areas={[
                    {
                      color: theme.graphs.cpu.percent,
                      dataKey: 'CPU %',
                    },
                  ]}
                  xAxis={{
                    tickFormat: 'hh a',
                    tickGap: 60,
                  }}
                  ariaLabel="CPU Usage Graph"
                  data={formatData2(data.cpu, 'CPU %')}
                  height={chartHeight}
                  timezone={timezone}
                  unit={'%'}
                />
              </Box>
            ) : (
              <StyledCanvasContainerDiv>
                <LineGraph
                  data={[
                    {
                      backgroundColor: theme.graphs.cpu.percent,
                      borderColor: 'transparent',
                      data: formatData(data.cpu),
                      label: 'CPU %',
                    },
                  ]}
                  accessibleDataTable={{ unit: '%' }}
                  ariaLabel="CPU Usage Graph"
                  chartHeight={chartHeight}
                  showToday={true}
                  timezone={timezone}
                />
              </StyledCanvasContainerDiv>
            )}
          </StyledRootDiv>
        );
      },
      title: 'CPU Usage (%)',
    },
    {
      render: () => {
        return (
          <StyledRootDiv>
            <div>{summaryCopy}</div>
            {flags.recharts ? (
              <Box marginLeft={-4} marginTop={3}>
                <AreaChart
                  areas={[
                    {
                      color: theme.graphs.network.inbound,
                      dataKey: 'Network Traffic In',
                    },
                    {
                      color: theme.graphs.network.outbound,
                      dataKey: 'Network Traffic Out',
                    },
                  ]}
                  xAxis={{
                    tickFormat: 'hh a',
                    tickGap: 60,
                  }}
                  ariaLabel="Network Transfer Graph"
                  data={networkTransferData}
                  height={chartHeight}
                  showLegend
                  timezone={timezone}
                  unit={' Kb/s'}
                />
              </Box>
            ) : (
              <StyledCanvasContainerDiv>
                <LineGraph
                  data={[
                    {
                      backgroundColor: theme.graphs.network.inbound,
                      borderColor: 'transparent',
                      data: formatData(data.net_in),
                      label: 'Network Traffic In',
                    },
                    {
                      backgroundColor: theme.graphs.network.outbound,
                      borderColor: 'transparent',
                      data: formatData(data.net_out),
                      label: 'Network Traffic Out',
                    },
                  ]}
                  accessibleDataTable={{ unit: 'Kb/s"' }}
                  ariaLabel="Network Transfer Graph"
                  chartHeight={chartHeight}
                  formatData={convertNetworkData}
                  formatTooltip={_formatTooltip}
                  nativeLegend
                  showToday={true}
                  timezone={timezone}
                  unit="/s"
                />
              </StyledCanvasContainerDiv>
            )}
          </StyledRootDiv>
        );
      },
      title: `Network Transfer (${unit}/s)`,
    },
    {
      render: () => {
        return (
          <StyledRootDiv>
            <div>{summaryCopy}</div>
            {flags.recharts ? (
              <Box marginLeft={-4} marginTop={3}>
                <AreaChart
                  areas={[
                    {
                      color: theme.graphs.yellow,
                      dataKey: 'Disk I/O',
                    },
                  ]}
                  xAxis={{
                    tickFormat: 'hh a',
                    tickGap: 60,
                  }}
                  ariaLabel="Disk I/O Graph"
                  data={formatData2(data.disk, 'Disk I/O')}
                  height={chartHeight}
                  timezone={timezone}
                  unit={' op/s'}
                />
              </Box>
            ) : (
              <StyledCanvasContainerDiv>
                <LineGraph
                  data={[
                    {
                      backgroundColor: theme.graphs.yellow,
                      borderColor: 'transparent',
                      data: formatData(data.disk),
                      label: 'Disk I/O',
                    },
                  ]}
                  accessibleDataTable={{ unit: 'op/s' }}
                  ariaLabel="Disk I/O Graph"
                  chartHeight={chartHeight}
                  showToday={true}
                  timezone={timezone}
                />
              </StyledCanvasContainerDiv>
            )}
          </StyledRootDiv>
        );
      },
      title: 'Disk I/O (op/s)',
    },
  ];
};

export const ManagedChartPanel = () => {
  const theme = useTheme();
  const flags = useFlags();
  const { data: profile } = useProfile();
  const timezone = getUserTimezone(profile?.timezone);
  const { data, error, isLoading } = useManagedStatsQuery();

  if (error) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(
            error,
            'Unable to load your usage statistics.'
          )[0].reason
        }
      />
    );
  }

  if (isLoading) {
    return (
      <StyledGraphControlsDiv>
        <CircleProgress />
      </StyledGraphControlsDiv>
    );
  }

  if (!data) {
    return null;
  }

  const tabs = createTabs(data.data, timezone, theme, flags);

  const initialTab = 0;

  return (
    <StyledGraphControlsDiv>
      <TabbedPanel
        copy={''}
        error={undefined} // Use custom error handling (above)
        header={''}
        initTab={initialTab}
        rootClass={`tabbedPanel`}
        tabs={tabs}
      />
    </StyledGraphControlsDiv>
  );
};

export default ManagedChartPanel;
