import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import { withTheme, WithTheme } from '@mui/styles';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import {
  formatNetworkTooltip,
  getMaxUnitAndFormatNetwork,
  sumNetwork,
} from 'src/features/Longview/shared/utilities';
import { convertData } from '../../../shared/formatters';
import { GraphProps } from './types';
import { useGraphs } from './useGraphs';

export type CombinedProps = GraphProps & WithTheme;

export const NetworkGraph: React.FC<CombinedProps> = (props) => {
  const {
    clientAPIKey,
    end,
    isToday,
    lastUpdated,
    lastUpdatedError,
    start,
    theme,
    timezone,
  } = props;

  const { data, error, loading, request } = useGraphs(
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

  const { formatNetwork, maxUnit } = getMaxUnitAndFormatNetwork(
    rx_bytes,
    tx_bytes
  );

  return (
    <LongviewLineGraph
      title="Network"
      subtitle={maxUnit + '/s'}
      unit={'/s'}
      ariaLabel="Network Usage Graph"
      formatData={formatNetwork}
      formatTooltip={formatNetworkTooltip}
      error={error}
      loading={loading}
      showToday={isToday}
      timezone={timezone}
      nativeLegend
      data={[
        {
          backgroundColor: theme.graphs.network.inbound,
          borderColor: 'transparent',
          data: _convertData(rx_bytes, start, end),
          label: 'Inbound',
        },
        {
          backgroundColor: theme.graphs.network.outbound,
          borderColor: 'transparent',
          data: _convertData(tx_bytes, start, end),
          label: 'Outbound',
        },
      ]}
    />
  );
};

const enhanced = compose<CombinedProps, GraphProps>(React.memo, withTheme);

export default enhanced(NetworkGraph);
