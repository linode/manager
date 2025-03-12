import { Box, CircleProgress, ErrorState, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { AreaChart } from 'src/components/AreaChart/AreaChart';
import { TabbedPanel } from 'src/components/TabbedPanel/TabbedPanel';
import {
  convertNetworkToUnit,
  generateNetworkUnits,
} from 'src/features/Longview/shared/utilities';
import { useManagedStatsQuery } from 'src/queries/managed/managed';
import { useProfile } from '@linode/queries';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getUserTimezone } from 'src/utilities/getUserTimezone';

import {
  StyledGraphControlsDiv,
  StyledRootDiv,
} from './ManagedChartPanel.styles';

import type { DataSeries, ManagedStatsData } from '@linode/api-v4/lib/managed';
import type { Theme } from '@mui/material/styles';

const chartHeight = 300;

interface NetworkTransferProps {
  'Network Traffic In': number;
  'Network Traffic Out': number;
  timestamp: number;
}

const formatData2 = (value: DataSeries[], label: string) =>
  value.map((thisPoint) => ({ [label]: thisPoint.y, timestamp: thisPoint.x }));

const createTabs = (
  data: ManagedStatsData | undefined,
  timezone: string,
  theme: Theme
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

  for (let i = 0; i < data.net_in.length; i++) {
    networkTransferData.push({
      'Network Traffic In': convertNetworkData(data.net_in[i].y),
      'Network Traffic Out': convertNetworkData(data.net_out[i].y),
      timestamp: data.net_in[i].x,
    });
  }

  return [
    {
      render: () => {
        return (
          <StyledRootDiv>
            <div>{summaryCopy}</div>
            <Box marginTop={2}>
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
            <Box marginTop={2}>
              <AreaChart
                areas={[
                  {
                    color: theme.graphs.darkGreen,
                    dataKey: 'Network Traffic In',
                  },
                  {
                    color: theme.graphs.lightGreen,
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
            <Box marginTop={3}>
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
          </StyledRootDiv>
        );
      },
      title: 'Disk I/O (op/s)',
    },
  ];
};

export const ManagedChartPanel = () => {
  const theme = useTheme();
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

  const tabs = createTabs(data.data, timezone, theme);

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
