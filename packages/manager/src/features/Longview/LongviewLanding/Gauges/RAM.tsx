import { useTheme } from '@mui/material/styles';
import { pathOr } from 'ramda';
import * as React from 'react';

import { GaugePercent } from 'src/components/GaugePercent/GaugePercent';
import { Typography } from 'src/components/Typography';
import withClientData, {
  Props as LVDataProps,
} from 'src/containers/longview.stats.container';
import { readableBytes } from 'src/utilities/unitConversions';

import {
  generateTotalMemory,
  generateUsedMemory,
} from '../../shared/utilities';
import { BaseProps as Props, baseGaugeProps } from './common';

type CombinedProps = Props & LVDataProps;

export const RAMGauge = withClientData<Props>((ownProps) => ownProps.clientID)(
  (props: CombinedProps) => {
    const {
      lastUpdatedError,
      longviewClientData,
      longviewClientDataError: error,
      longviewClientDataLoading: loading,
    } = props;

    const theme = useTheme();

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
      subTitle: JSX.Element | string;
    } => {
      if (error || lastUpdatedError) {
        return {
          innerText: 'Error',
          subTitle: (
            <Typography>
              <strong>RAM</strong>
            </Typography>
          ),
        };
      }

      if (loading) {
        return {
          innerText: 'Loading',
          subTitle: (
            <Typography>
              <strong>RAM</strong>
            </Typography>
          ),
        };
      }

      /** first convert memory from KB to bytes */
      const usedMemoryToBytes = finalUsedMemory * 1024;
      const howManyBytesInGB = 1073741824;

      const convertedUsedMemory = readableBytes(
        /** convert KB to bytes */
        usedMemoryToBytes,
        {
          unit: usedMemoryToBytes > howManyBytesInGB ? 'GB' : 'MB',
        }
      );

      const convertedTotalMemory = readableBytes(
        /** convert KB to bytes */
        totalMemory * 1024,
        {
          unit: 'GB',
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
        ),
      };
    };

    return (
      <GaugePercent
        {...baseGaugeProps}
        filledInColor={theme.graphs.purple}
        max={totalMemory}
        value={finalUsedMemory}
        {...generateText()}
      />
    );
  }
);
