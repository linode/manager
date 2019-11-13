import { APIError } from 'linode-js-sdk/lib/types';
import { pathOr } from 'ramda';
import * as React from 'react';
import Typography from 'src/components/core/Typography';
import GaugePercent from 'src/components/GaugePercent';
import withClientData, {
  Props as LVDataProps
} from 'src/containers/longview.stats.container';
import { readableBytes } from 'src/utilities/unitConversions';
import { baseGaugeProps } from './common';

interface Props {
  clientID: number;
  lastUpdatedError?: APIError[];
}

const SwapGauge: React.FC<Props & LVDataProps> = props => {
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
      filledInColor="#DC4138"
      {...generateText()}
    />
  );
};

export default withClientData<Props>(ownProps => ownProps.clientID)(SwapGauge);
