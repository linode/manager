import { Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { GaugePercent } from 'src/components/GaugePercent/GaugePercent';
import withClientData from 'src/containers/longview.stats.container';
import { readableBytes } from 'src/utilities/unitConversions';

import { baseGaugeProps } from './common';

import type { BaseProps as Props } from './common';
import type { Props as LVDataProps } from 'src/containers/longview.stats.container';

interface SwapGaugeProps extends Props, LVDataProps {}

export const SwapGauge = withClientData<Props>((ownProps) => ownProps.clientID)(
  (props: SwapGaugeProps) => {
    const {
      lastUpdatedError,
      longviewClientData,
      longviewClientDataError: error,
      longviewClientDataLoading: loading,
    } = props;

    const theme = useTheme();

    const freeMemory = longviewClientData?.Memory?.swap?.free?.[0]?.y ?? 0;
    const usedMemory = longviewClientData?.Memory?.swap?.used?.[0]?.y ?? 0;
    const totalMemory = usedMemory + freeMemory;

    const generateText = (): {
      innerText: string;
      subTitle: JSX.Element | string;
    } => {
      if (error || lastUpdatedError) {
        return {
          innerText: 'Error',
          subTitle: (
            <Typography>
              <strong>Swap</strong>
            </Typography>
          ),
        };
      }

      if (loading) {
        return {
          innerText: 'Loading',
          subTitle: (
            <Typography>
              <strong>Swap</strong>
            </Typography>
          ),
        };
      }

      /** first convert memory from KB to bytes */
      const usedMemoryToBytes = usedMemory * 1024;

      const convertedUsedMemory = readableBytes(
        /** convert KB to bytes */
        usedMemoryToBytes,
        {
          unit: 'MB',
        }
      );

      const convertedTotalMemory = readableBytes(
        /** convert KB to bytes */
        totalMemory * 1024,
        {
          unit: 'MB',
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
        ),
      };
    };

    return (
      <GaugePercent
        {...baseGaugeProps}
        filledInColor={theme.graphs.red}
        max={totalMemory}
        value={usedMemory}
        {...generateText()}
      />
    );
  }
);
