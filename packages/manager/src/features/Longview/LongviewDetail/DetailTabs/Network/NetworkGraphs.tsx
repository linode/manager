import { CircleProgress, ErrorState } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { LongviewLineGraph } from 'src/components/LongviewLineGraph/LongviewLineGraph';
import { Placeholder } from 'src/components/Placeholder/Placeholder';
import {
  convertNetworkToUnit,
  formatNetworkTooltip,
  generateNetworkUnits,
  statMax,
} from 'src/features/Longview/shared/utilities';

import { convertData } from '../../../shared/formatters';
import GraphCard from '../../GraphCard';

import type {
  InboundOutboundNetwork,
  LongviewNetworkInterface,
} from '../../../request.types';

interface Props {
  end: number;
  error?: string;
  isToday: boolean;
  loading: boolean;
  networkData: LongviewNetworkInterface;
  start: number;
  timezone: string;
}

export const NetworkGraphs = (props: Props) => {
  const { end, error, isToday, loading, networkData, start, timezone } = props;

  const theme = useTheme();

  const _convertData = React.useCallback(convertData, [
    networkData,
    start,
    end,
  ]);

  // Sort interfaces by label alphabetically
  const interfaces = Object.entries(networkData).sort(sortInterfaces);

  if (loading && interfaces.length === 0) {
    return <CircleProgress />;
  }

  if (error) {
    // We have to show a global error state, since there won't be any
    // interfaces or graphs if the request failed.
    return <ErrorState errorText={error} />;
  }

  if (interfaces.length === 0 && !loading) {
    // Empty state
    return (
      <Placeholder renderAsSecondary title="No network interfaces detected">
        The Longview agent has not detected any interfaces that it can monitor.
      </Placeholder>
    );
  }

  return (
    <>
      {interfaces.map((thisInterface, idx) => {
        const [name, interfaceData] = thisInterface;
        const { rx_bytes, tx_bytes } = interfaceData;

        const maxUnit = generateNetworkUnits(
          Math.max(statMax(rx_bytes), statMax(tx_bytes))
        );

        return (
          <GraphCard key={`network-interface-card-${idx}`} title={name}>
            <div style={{ paddingTop: theme.spacing(2) }}>
              <LongviewLineGraph
                data={[
                  {
                    backgroundColor: theme.graphs.darkGreen,
                    borderColor: 'transparent',
                    data: _convertData(rx_bytes, start, end),
                    label: 'Inbound',
                  },
                  {
                    backgroundColor: theme.graphs.lightGreen,
                    borderColor: 'transparent',
                    data: _convertData(tx_bytes, start, end),
                    label: 'Outbound',
                  },
                ]}
                formatData={(value: number) =>
                  convertNetworkToUnit(value * 8, maxUnit)
                }
                ariaLabel="Network Traffic Graph"
                error={error}
                formatTooltip={formatNetworkTooltip}
                loading={loading}
                nativeLegend
                showToday={isToday}
                subtitle={maxUnit + '/s'}
                timezone={timezone}
                title="Network Traffic"
                unit={'/s'}
              />
            </div>
          </GraphCard>
        );
      })}
    </>
  );
};

type InterfaceItem = [string, InboundOutboundNetwork<''>];
export const sortInterfaces = (a: InterfaceItem, b: InterfaceItem) => {
  if (a[0] > b[0]) {
    return 1;
  }
  if (a[0] < b[0]) {
    return -1;
  }
  return 0;
};
