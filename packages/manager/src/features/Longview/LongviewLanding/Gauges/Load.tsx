import { WithTheme, withTheme } from '@mui/styles';
import { pathOr } from 'ramda';
import * as React from 'react';

import { GaugePercent } from 'src/components/GaugePercent/GaugePercent';
import { Typography } from 'src/components/Typography';
import withClientData, {
  Props as LVDataProps,
} from 'src/containers/longview.stats.container';

import { BaseProps as Props, baseGaugeProps } from './common';

type CombinedProps = Props & WithTheme & LVDataProps;

const LoadGauge: React.FC<CombinedProps> = (props) => {
  const {
    lastUpdatedError,
    longviewClientData,
    longviewClientDataError: error,
    longviewClientDataLoading: loading,
  } = props;

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
      filledInColor={props.theme.graphs.yellow}
      max={numberOfCores}
      value={load}
      {...generateCopy()}
    />
  );
};

export default withClientData<Props>((ownProps) => ownProps.clientID)(
  withTheme(LoadGauge)
);
