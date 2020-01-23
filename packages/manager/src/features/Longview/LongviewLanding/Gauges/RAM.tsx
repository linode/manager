import { pathOr } from 'ramda';
import * as React from 'react';
import { WithTheme, withTheme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import GaugePercent from 'src/components/GaugePercent';
import {
  generateTotalMemory,
  generateUsedMemory
} from '../../shared/utilities';
import { baseGaugeProps, BaseProps as Props } from './common';

import { readableBytes } from 'src/utilities/unitConversions';

import withClientData, {
  Props as LVDataProps
} from 'src/containers/longview.stats.container';

type commbinedProps = Props & WithTheme & LVDataProps;

const RAMGauge: React.FC<commbinedProps> = props => {
  const {
    longviewClientDataError: error,
    longviewClientDataLoading: loading,
    longviewClientData,
    lastUpdatedError
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
    if (error || lastUpdatedError) {
      return {
        innerText: 'Error',
        subTitle: (
          <Typography>
            <strong>RAM</strong>
          </Typography>
        )
      };
    }

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
      filledInColor={props.theme.graphs.purple}
      {...generateText()}
    />
  );
};

export default withClientData<Props>(ownProps => ownProps.clientID)(
  withTheme(RAMGauge)
);
