import { Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { GaugePercent } from 'src/components/GaugePercent/GaugePercent';
import withClientData from 'src/containers/longview.stats.container';

import { baseGaugeProps } from './common';

import type { BaseProps as Props } from './common';
import type { Props as LVDataProps } from 'src/containers/longview.stats.container';

interface LoadGaugeProps extends Props, LVDataProps {}

export const LoadGauge = withClientData<Props>((ownProps) => ownProps.clientID)(
  (props: LoadGaugeProps) => {
    const {
      lastUpdatedError,
      longviewClientData,
      longviewClientDataError: error,
      longviewClientDataLoading: loading,
    } = props;

    const theme = useTheme();

    const load = longviewClientData?.Load?.[0]?.y ?? 0;
    const numberOfCores = longviewClientData?.SysInfo?.cpu?.cores ?? 0;

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
