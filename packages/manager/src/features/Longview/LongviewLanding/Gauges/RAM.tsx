import { Typography } from '@linode/ui';
import { readableBytes } from '@linode/utilities';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { GaugePercent } from 'src/components/GaugePercent/GaugePercent';
import withClientData from 'src/containers/longview.stats.container';

import {
  generateTotalMemory,
  generateUsedMemory,
} from '../../shared/utilities';
import { baseGaugeProps } from './common';

import type { BaseProps as Props } from './common';
import type { Props as LVDataProps } from 'src/containers/longview.stats.container';

interface RAMGaugeProps extends Props, LVDataProps {}

export const RAMGauge = withClientData<Props>((ownProps) => ownProps.clientID)(
  (props: RAMGaugeProps) => {
    const {
      lastUpdatedError,
      longviewClientData,
      longviewClientDataError: error,
      longviewClientDataLoading: loading,
    } = props;

    const theme = useTheme();

    const usedMemory = longviewClientData?.Memory?.real?.used?.[0]?.y ?? 0;
    const freeMemory = longviewClientData?.Memory?.real?.free?.[0]?.y ?? 0;
    const buffers = longviewClientData?.Memory?.real?.buffers?.[0]?.y ?? 0;
    const cache = longviewClientData?.Memory?.real?.cache?.[0]?.y ?? 0;

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
