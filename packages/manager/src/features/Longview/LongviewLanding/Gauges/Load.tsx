import { pathOr } from 'ramda';
import * as React from 'react';
import { WithTheme, withTheme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import GaugePercent from 'src/components/GaugePercent';
import withClientData, {
  Props as LVDataProps
} from 'src/containers/longview.stats.container';
import { baseGaugeProps, BaseProps as Props } from './common';

type CombinedProps = Props & WithTheme & LVDataProps;

const LoadGauge: React.FC<CombinedProps> = props => {
  const {
    longviewClientData,
    longviewClientDataLoading: loading,
    longviewClientDataError: error,
    lastUpdatedError
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
        )
      };
    }

    if (loading) {
      return {
        innerText: 'Loading...',
        subTitle: (
          <Typography>
            <strong>Load</strong>
          </Typography>
        )
      };
    }

    return {
      innerText: `${(load || 0).toFixed(2)}`,
      subTitle: (
        <React.Fragment>
          <Typography>
            <strong>Load</strong>
          </Typography>
        </React.Fragment>
      )
    };
  };

  React.useEffect(() => {
    generateCopy();
  }, []);

  return (
    <GaugePercent
      {...baseGaugeProps}
      max={numberOfCores}
      value={load}
      filledInColor={props.theme.graphs.yellow}
    />
  );
};

export default withClientData<Props>(ownProps => ownProps.clientID)(
  withTheme(LoadGauge)
);
