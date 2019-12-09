import { pathOr } from 'ramda';
import * as React from 'react';
import { withTheme, WithTheme } from 'src/components/core/styles';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { readableBytes } from 'src/utilities/unitConversions';
import { AllData, getValues } from '../../../request';
import { Stat } from '../../../request.types';
import { convertData } from '../../../shared/formatters';
import { generateUsedMemory, statMax } from '../../../shared/utilities';

interface Props {
  clientAPIKey: string;
  isToday: boolean;
  timezone: string;
  start: number;
  end: number;
}

export type CombinedProps = Props & WithTheme;

export const MemoryGraph: React.FC<CombinedProps> = props => {
  const { clientAPIKey, end, isToday, start, theme, timezone } = props;

  const [data, setData] = React.useState<Partial<AllData>>({});
  const request = () => {
    return getValues(clientAPIKey, {
      fields: ['memory'],
      start,
      end
    }).then(response => {
      setData(response);
    });
  };

  React.useEffect(() => {
    request();
  }, [start, end, clientAPIKey]);

  const _convertData = React.useCallback(convertData, [data, start, end]);

  return (
    <LongviewLineGraph
      title="Disk I/O"
      subtitle={'ops/second'}
      showToday={isToday}
      timezone={timezone}
      data={[
        {
          label: 'Read',
          borderColor: theme.graphs.redBorder,
          backgroundColor: theme.graphs.red,
          data: _convertData([], start)
        },
        {
          label: 'Write',
          borderColor: theme.graphs.pinkBorder,
          backgroundColor: theme.graphs.pink,
          data: _convertData([], start)
        },
        {
          label: 'Swap',
          borderColor: theme.graphs.purpleBorder,
          backgroundColor: theme.graphs.purple,
          data: _convertData([], start)
        }
      ]}
    />
  );
};

export default withTheme(MemoryGraph);
