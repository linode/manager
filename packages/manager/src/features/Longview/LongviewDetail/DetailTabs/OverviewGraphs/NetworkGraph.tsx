import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { LongviewLineGraph } from 'src/components/LongviewLineGraph/LongviewLineGraph';
import {
  formatNetworkTooltip,
  getMaxUnitAndFormatNetwork,
  sumNetwork,
} from 'src/features/Longview/shared/utilities';

import { convertData } from '../../../shared/formatters';
import { useGraphs } from './useGraphs';

import type { GraphProps } from './types';

export const NetworkGraph = React.memo((props: GraphProps) => {
  const {
    clientAPIKey,
    end,
    isToday,
    lastUpdated,
    lastUpdatedError,
    start,
    timezone,
  } = props;

  const theme = useTheme();

  const { data, error, loading, request } = useGraphs(
    ['network'],
    clientAPIKey,
    start,
    end
  );

  const networkData = React.useMemo(
    () => sumNetwork(data.Network?.Interface ?? {}),
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
      ariaLabel="Network Usage Graph"
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
      error={error}
      formatData={formatNetwork}
      formatTooltip={formatNetworkTooltip}
      loading={loading}
      nativeLegend
      showToday={isToday}
      subtitle={maxUnit + '/s'}
      timezone={timezone}
      title="Network"
      unit={'/s'}
    />
  );
});
