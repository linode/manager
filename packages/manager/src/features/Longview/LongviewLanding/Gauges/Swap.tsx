import { pathOr } from 'ramda';
import * as React from 'react';
import { WithTheme, withTheme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import GaugePercent from 'src/components/GaugePercent';
import withClientData, {
  Props as LVDataProps
} from 'src/containers/longview.stats.container';
import { readableBytes } from 'src/utilities/unitConversions';
import { baseGaugeProps, BaseProps as Props } from './common';

type CombinedProps = Props & WithTheme & LVDataProps;

const SwapGauge: React.FC<CombinedProps> = props => {
  const {
    longviewClientDataError: error,
    longviewClientDataLoading: loading,
    longviewClientData,
    lastUpdatedError
  } = props;

  const freeMemory = pathOr<number>(
    0,
    ['Memory', 'swap', 'free', 0, 'y'],
    longviewClientData
  );
  const usedMemory = pathOr<number>(
    0,
    ['Memory', 'swap', 'used', 0, 'y'],
    longviewClientData
  );

  const totalMemory = usedMemory + freeMemory;

  const generateText = (): {
    innerText: string;
    subTitle: string | JSX.Element;
  } => {
    if (error || lastUpdatedError) {
      return {
        innerText: 'Error',
        subTitle: (
          <Typography>
            <strong>Swap</strong>
          </Typography>
        )
      };
    }

    if (loading) {
      return {
        innerText: 'Loading',
        subTitle: (
          <Typography>
            <strong>Swap</strong>
          </Typography>
        )
      };
    }

    /** first convert memory from KB to bytes */
    const usedMemoryToBytes = usedMemory * 1024;

    const convertedUsedMemory = readableBytes(
      /** convert KB to bytes */
      usedMemoryToBytes,
      {
        unit: 'MB'
      }
    );

    const convertedTotalMemory = readableBytes(
      /** convert KB to bytes */
      totalMemory * 1024,
      {
        unit: 'MB'
      }
    );

    return {
      innerText: `${convertedUsedMemory.value} ${convertedUsedMemory.unit}`,
      subTitle: (
        <React.Fragment>
          <Typography>
            <strong>Swap</strong>
          </Typography>
          <Typography>{`${convertedTotalMemory.value} MB`}</Typography>
        </React.Fragment>
      )
    };
  };

  return (
    <GaugePercent
      {...baseGaugeProps}
      max={totalMemory}
      value={usedMemory}
      filledInColor={props.theme.graphs.red}
      {...generateText()}
    />
  );
};

export default withClientData<Props>(ownProps => ownProps.clientID)(
  withTheme(SwapGauge)
);
