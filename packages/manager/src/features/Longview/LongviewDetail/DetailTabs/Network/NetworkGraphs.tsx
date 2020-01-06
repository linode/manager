import * as React from 'react';
import { withTheme, WithTheme } from 'src/components/core/styles';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { getMaxUnitAndFormatNetwork } from 'src/features/Longview/shared/utilities';
import {
  InboundOutboundNetwork,
  LongviewNetworkInterface
} from '../../../request.types';
import { convertData } from '../../../shared/formatters';
import GraphCard from '../../GraphCard';

interface Props {
  networkData: LongviewNetworkInterface;
  error?: string;
  loading: boolean;
  timezone: string;
  isToday: boolean;
  start: number;
  end: number;
}

type CombinedProps = Props & WithTheme;

export const NetworkGraphs: React.FC<CombinedProps> = props => {
  const {
    end,
    error,
    isToday,
    loading,
    networkData,
    start,
    theme,
    timezone
  } = props;

  const _convertData = React.useCallback(convertData, [
    networkData,
    start,
    end
  ]);

  // Sort interfaces by label alphabetically
  const interfaces = Object.entries(networkData).sort(sortInterfaces);

  return (
    <>
      {interfaces.map((thisInterface, idx) => {
        const [name, interfaceData] = thisInterface;
        const { rx_bytes, tx_bytes } = interfaceData;

        const { maxUnit, formatNetwork } = getMaxUnitAndFormatNetwork(
          rx_bytes,
          tx_bytes
        );

        return (
          <GraphCard title={name} key={`network-interface-card-${idx}`}>
            <div style={{ paddingTop: theme.spacing(2) }}>
              <LongviewLineGraph
                title="Network Traffic"
                subtitle={maxUnit + '/s'}
                error={error}
                loading={loading}
                showToday={isToday}
                timezone={timezone}
                data={[
                  {
                    label: 'Inbound',
                    borderColor: theme.graphs.forestGreenBorder,
                    backgroundColor: theme.graphs.networkGreenInbound,
                    data: _convertData(rx_bytes, start, end, formatNetwork)
                  },
                  {
                    label: 'Outbound',
                    borderColor: theme.graphs.forestGreenBorder,
                    backgroundColor: theme.graphs.networkGreenOutbound,
                    data: _convertData(tx_bytes, start, end, formatNetwork)
                  }
                ]}
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

export default withTheme(NetworkGraphs);
