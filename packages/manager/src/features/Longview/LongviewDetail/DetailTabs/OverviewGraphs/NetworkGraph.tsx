import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import { withTheme, WithTheme } from 'src/components/core/styles';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import {
  getMaxUnitAndFormatNetwork,
  sumNetwork
} from 'src/features/Longview/shared/utilities';
import { convertData } from '../../../shared/formatters';
import { GraphProps } from './types';
import { useGraphs } from './useGraphs';

export type CombinedProps = GraphProps & WithTheme;

export const NetworkGraph: React.FC<CombinedProps> = props => {
  const {
    clientAPIKey,
    end,
    isToday,
    lastUpdated,
    lastUpdatedError,
    start,
    theme,
    timezone
  } = props;

  const { data, loading, error, request } = useGraphs(
    ['network'],
    clientAPIKey,
    start,
    end
  );

  const networkData = React.useMemo(
    () => sumNetwork(pathOr({}, ['Interface'], data.Network)),
    [data.Network]
  );

  React.useEffect(() => {
    request();
  }, [start, end, clientAPIKey, lastUpdated, lastUpdatedError]);

  const _convertData = React.useCallback(convertData, [data, start, end]);

  const { rx_bytes, tx_bytes } = networkData;

  const { maxUnit, formatNetwork } = getMaxUnitAndFormatNetwork(
    rx_bytes,
    tx_bytes
  );

  return (
    <LongviewLineGraph
      title="Network"
      subtitle={maxUnit + '/s'}
      tooltipUnit={maxUnit + '/s'}
      error={error}
      loading={loading}
      showToday={isToday}
      timezone={timezone}
      nativeLegend
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
  );
};

const enhanced = compose<CombinedProps, GraphProps>(React.memo, withTheme);

export default enhanced(NetworkGraph);
