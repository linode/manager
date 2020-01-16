import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import { withTheme, WithTheme } from 'src/components/core/styles';
import ErrorState from 'src/components/ErrorState';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import Placeholder from 'src/components/Placeholder';
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
      <Placeholder
        title="No network interfaces detected"
        copy="The Longview agent has not detected any interfaces that it can monitor."
      />
    );
  }

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
                nativeLegend
                subtitle={maxUnit + '/s'}
                tooltipUnit={maxUnit + '/s'}
                error={error}
                loading={loading}
                showToday={isToday}
                timezone={timezone}
                data={[
                  {
                    label: 'Inbound',
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.network.inbound,
                    data: _convertData(rx_bytes, start, end, formatNetwork)
                  },
                  {
                    label: 'Outbound',
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.network.outbound,
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
