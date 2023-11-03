import { useTheme } from '@mui/material/styles';
import { pathOr } from 'ramda';
import * as React from 'react';

import { GaugePercent } from 'src/components/GaugePercent/GaugePercent';
import { Typography } from 'src/components/Typography';
import withClientData, {
  Props as LVDataProps,
} from 'src/containers/longview.stats.container';
import { readableBytes } from 'src/utilities/unitConversions';

import { BaseProps as Props, baseGaugeProps } from './common';

type CombinedProps = Props & LVDataProps;

export const SwapGauge = withClientData<Props>((ownProps) => ownProps.clientID)(
  (props: CombinedProps) => {
    const {
      lastUpdatedError,
      longviewClientData,
      longviewClientDataError: error,
      longviewClientDataLoading: loading,
    } = props;

    const theme = useTheme();

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
