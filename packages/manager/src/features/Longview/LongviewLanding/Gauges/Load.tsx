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
  const [load, setLoad] = React.useState<number | undefined>(undefined);
  const [amountOfCores, setCores] = React.useState<number | undefined>(
    undefined
  );
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<APIError | undefined>(undefined);

  React.useEffect(() => {
    let mounted = true;
    requestStats(props.token, 'getLatestValue', ['sysinfo', 'load'])
      .then(response => {
        if (mounted) {
          setLoad(response.Load[0].y);
          setCores(pathOr(0, ['cpu', 'cores'], response.SysInfo));
          setError(undefined);

          if (!!loading) {
            setLoading(false);
          }
        }
      })
      .catch(() => {
        if (!load && mounted) {
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
          <Typography>
            {`${getOverallocationPercent(
              amountOfCores || 0,
              load || 0
            )}% Overallocated`}
          </Typography>
        </React.Fragment>
      )
    };
  };

  return (
    <GaugePercent
      {...baseGaugeProps}
      max={amountOfCores || 1}
      value={load || 1}
      filledInColor="#FADB50"
      {...generateCopy()}
    />
  );
};

export const getOverallocationPercent = (
  amountOfCores: number,
  load: number
) => {
  /** we have a negative number meaning we're overallocated */
  const allocation = amountOfCores - load;
  if (allocation < 0) {
    /** turn into a positive number as a percent */
    return Math.round(allocation * 100 * -1);
  }

  return 0;
};

export default LoadGauge;
