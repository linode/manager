import { APIError } from 'linode-js-sdk/lib/types';
import { pathOr } from 'ramda';
import * as React from 'react';
import Typography from 'src/components/core/Typography';
import GaugePercent from 'src/components/GaugePercent';
import { baseGaugeProps } from './common';

import requestStats from '../../request';

interface Props {
  lastUpdated?: number;
  token: string;
}

const LoadGauge: React.FC<Props> = props => {
  const [dataHasResolvedAtLeastOnce, setDataResolved] = React.useState<boolean>(
    false
  );
  const [load, setLoad] = React.useState<number>(0);
  const [amountOfCores, setCores] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<APIError | undefined>();

  React.useEffect(() => {
    let mounted = true;
    requestStats(props.token, 'getLatestValue', ['sysinfo', 'load'])
      .then(response => {
        if (mounted) {
          setLoad(pathOr(0, ['Load', 0, 'y'], response));
          setCores(pathOr(0, ['cpu', 'cores'], response.SysInfo));
          setError(undefined);

          if (!!loading) {
            setLoading(false);
          }
          if (!dataHasResolvedAtLeastOnce) {
            setDataResolved(true);
          }
        }
      })
      .catch(() => {
        if (!dataHasResolvedAtLeastOnce && mounted) {
          setError({
            reason: 'Error'
          });
          if (!!loading) {
            setLoading(false);
          }
        }
      });

    return () => {
      mounted = false;
    };
  }, [props.lastUpdated]);

  const generateCopy = (): {
    innerText: string;
    subTitle: JSX.Element | null;
  } => {
    if (error) {
      return {
        innerText: error.reason,
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
      max={amountOfCores}
      value={load}
      filledInColor="#FADB50"
      {...generateCopy()}
    />
  );
};

export default LoadGauge;
