import { DataSeries, ManagedStatsData } from '@linode/api-v4/lib/managed';
import { useTheme } from '@mui/material/styles';
import { Theme } from '@mui/material/styles';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LineGraph } from 'src/components/LineGraph/LineGraph';
import { TabbedPanel } from 'src/components/TabbedPanel/TabbedPanel';
import { Typography } from 'src/components/Typography';
import {
  convertNetworkToUnit,
  formatNetworkTooltip,
  generateNetworkUnits,
} from 'src/features/Longview/shared/utilities';
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

const formatData = (value: DataSeries[]): [number, number][] =>
  value.map((thisPoint) => [thisPoint.x, thisPoint.y]);

const _formatTooltip = (valueInBytes: number) =>
  formatNetworkTooltip(valueInBytes / 8);

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

  return [
    {
      render: () => {
        return (
          <StyledRootDiv>
            <div>{summaryCopy}</div>
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
    return <CircleProgress />;
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
