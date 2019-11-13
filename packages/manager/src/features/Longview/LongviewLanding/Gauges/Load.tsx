import { pathOr } from 'ramda';
import * as React from 'react';
import Typography from 'src/components/core/Typography';
import GaugePercent from 'src/components/GaugePercent';
import withClientData, {
  Props as LVDataProps
} from 'src/containers/longview.stats.container';
import { baseGaugeProps } from './common';

interface Props {
  clientID: number;
}

const LoadGauge: React.FC<Props & LVDataProps> = props => {
  const {
    longviewClientData,
    longviewClientDataLoading: loading,
    longviewClientDataError: error
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
    if (error) {
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

  return (
    <GaugePercent
      {...baseGaugeProps}
      max={numberOfCores}
      value={load}
      filledInColor="#FADB50"
      {...generateCopy()}
    />
  );
};

export default withClientData<Props>(ownProps => ownProps.clientID)(LoadGauge);
