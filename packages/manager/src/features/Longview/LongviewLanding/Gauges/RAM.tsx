import { pathOr } from 'ramda';
import * as React from 'react';
import Typography from 'src/components/core/Typography';
import GaugePercent from 'src/components/GaugePercent';
import { baseGaugeProps } from './common';

import { readableBytes } from 'src/utilities/unitConversions';

import withClientData, {
  Props as LVDataProps
} from 'src/containers/longview.stats.container';

interface Props {
  clientID: number;
}

const RAMGauge: React.FC<Props & LVDataProps> = props => {
  const {
    longviewClientDataError: error,
    longviewClientDataLoading: loading,
    longviewClientData
  } = props;

  const usedMemory = pathOr(
    0,
    ['Memory', 'real', 'used', 0, 'y'],
    longviewClientData
  );
  const freeMemory = pathOr(
    0,
    ['Memory', 'real', 'free', 0, 'y'],
    longviewClientData
  );
  const buffers = pathOr(
    0,
    ['Memory', 'real', 'buffers', 0, 'y'],
    longviewClientData
  );
  const cache = pathOr(
    0,
    ['Memory', 'real', 'cache', 0, 'y'],
    longviewClientData
  );

  const finalUsedMemory = generateUsedMemory(usedMemory, buffers, cache);
  const totalMemory = generateTotalMemory(usedMemory, freeMemory);

  const generateText = (): {
    innerText: string;
    subTitle: string | JSX.Element;
  } => {
    if (loading) {
      return {
        innerText: 'Loading',
        subTitle: (
          <Typography>
            <strong>RAM</strong>
          </Typography>
        )
      };
    }

    if (error) {
      return {
        innerText: 'Error',
        subTitle: (
          <Typography>
            <strong>RAM</strong>
          </Typography>
        )
      };
    }

    /** first convert memory from KB to bytes */
    const usedMemoryToBytes = finalUsedMemory * 1024;
    const howManyBytesInGB = 1073741824;

    const convertedUsedMemory = readableBytes(
      /** convert KB to bytes */
      usedMemoryToBytes,
      {
        unit: usedMemoryToBytes > howManyBytesInGB ? 'GB' : 'MB'
      }
    );

    const convertedTotalMemory = readableBytes(
      /** convert KB to bytes */
      totalMemory * 1024,
      {
        unit: 'GB'
      }
    );

    return {
      innerText: `${convertedUsedMemory.value} ${convertedUsedMemory.unit}`,
      subTitle: (
        <React.Fragment>
          <Typography>
            <strong>RAM</strong>
          </Typography>
          <Typography>{`${convertedTotalMemory.value} GB`}</Typography>
        </React.Fragment>
      )
    };
  };

  return (
    <GaugePercent
      {...baseGaugeProps}
      max={totalMemory}
      value={finalUsedMemory}
      filledInColor="#D38ADB"
      {...generateText()}
    />
  );
};

export const generateUsedMemory = (
  used: number,
  buffers: number,
  cache: number
) => {
  /**
   * calculation comes from original implementation of Longview.JS
   */
  const result = used - (buffers + cache);
  return result < 0 ? 0 : result;
};

export const generateTotalMemory = (used: number, free: number) => used + free;

export default withClientData<Props>(ownProps => ownProps.clientID)(RAMGauge);
