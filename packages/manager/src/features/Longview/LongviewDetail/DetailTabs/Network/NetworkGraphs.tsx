import * as React from 'react';
import { withTheme, WithTheme } from 'src/components/core/styles';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { generateUnits } from 'src/features/Longview/LongviewLanding/Gauges/Network';
import { statMax } from 'src/features/Longview/shared/utilities';
import { LongviewNetworkInterface } from '../../../request.types';
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
  // const classes = useStyles();

  const _convertData = React.useCallback(convertData, [
    networkData,
    start,
    end
  ]);

  const interfaces = Object.entries(networkData);

  return (
    <>
      {interfaces.map((thisInterface, idx) => {
        const [name, interfaceData] = thisInterface;
        const { rx_bytes, tx_bytes } = interfaceData;

        // Determine the unit based on the largest value.
        const max = Math.max(statMax(rx_bytes), statMax(tx_bytes));
        const maxUnit = generateUnits(max).unit;

        const formatNetwork = (valueInBytes: number | null) => {
          if (valueInBytes === null) {
            return valueInBytes;
          }
          const valueInBits = valueInBytes * 8;

          if (maxUnit === 'Mb') {
            // If the unit we're using for the graph is Mb, return the output in Mb.
            const valueInMegabits = valueInBits / 1024 / 1024;
            return Math.round(valueInMegabits * 100) / 100;
          } else {
            // If the unit we're using for the graph is Kb, return the output in Kb.
            const valueInKilobits = valueInBits / 1024;
            return Math.round(valueInKilobits * 100) / 100;
          }
        };

        return (
          <GraphCard title={name} key={`network-interface-card-${idx}`}>
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
                  backgroundColor: theme.graphs.forestGreen,
                  data: _convertData(rx_bytes, start, end, formatNetwork)
                },
                {
                  label: 'Outbound',
                  borderColor: theme.graphs.forestGreenBorder,
                  backgroundColor: theme.graphs.forestGreen,
                  data: _convertData(tx_bytes, start, end, formatNetwork)
                }
              ]}
            />
          </GraphCard>
        );
      })}
    </>
  );
};

export default withTheme(NetworkGraphs);
