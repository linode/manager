import { useTheme } from '@mui/material/styles';
import { pathOr } from 'ramda';
import * as React from 'react';

import { GaugePercent } from 'src/components/GaugePercent/GaugePercent';
import { Typography } from 'src/components/Typography';
import withClientData, {
  Props as LVDataProps,
} from 'src/containers/longview.stats.container';

import { BaseProps as Props, baseGaugeProps } from './common';

type CombinedProps = Props & LVDataProps;

export const LoadGauge = withClientData<Props>((ownProps) => ownProps.clientID)(
  (props: CombinedProps) => {
    const {
      lastUpdatedError,
      longviewClientData,
      longviewClientDataError: error,
      longviewClientDataLoading: loading,
    } = props;

    const theme = useTheme();

    const load = pathOr<number>(0, ['Load', 0, 'y'], longviewClientData);
    const numberOfCores = pathOr<number>(
      0,
      ['SysInfo', 'cpu', 'cores'],
      longviewClientData
    );

    const generateCopy = (): {
      innerText: string;
      subTitle: JSX.Element | null;
    } => {
      if (error || lastUpdatedError) {
        return {
          innerText: 'Error',
          subTitle: (
            <Typography>
              <strong>Load</strong>
            </Typography>
          ),
        };
      }

      if (loading) {
        return {
          innerText: 'Loading...',
          subTitle: (
            <Typography>
              <strong>Load</strong>
            </Typography>
          ),
        };
      }

      return {
        innerText: `${(load || 0).toFixed(2)}`,
        subTitle: (
          <Typography>
            <strong>Load</strong>
          </Typography>
        ),
      };
    };

    return (
      <GaugePercent
        {...baseGaugeProps}
        filledInColor={theme.graphs.yellow}
        max={numberOfCores}
        value={load}
        {...generateCopy()}
      />
    );
  }
);
