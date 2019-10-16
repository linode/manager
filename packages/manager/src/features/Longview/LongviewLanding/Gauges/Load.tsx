import { APIError } from 'linode-js-sdk/lib/types';
import { pathOr } from 'ramda';
import React from 'react';
import Typography from 'src/components/core/Typography';
import GaugePercent from 'src/components/GaugePercent';
import { baseGaugeProps } from './common';

import requestStats from '../../request';

interface Props {
  lastUpdated: number;
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
    requestStats(props.token, 'getLatestValue', ['sysinfo', 'load'])
      .then(response => {
        setLoad(response.Load[0].y);
        setCores(pathOr(1, ['cpu', 'cores'], response.SysInfo));

        if (!!loading) {
          setLoading(false);
        }
      })
      .catch(e => {
        if (!load) {
          setError({
            reason: 'Error'
          });
        }
      });
  }, [props.lastUpdated]);

  const generateCopy = (): {
    innerText: string;
    subTitle: JSX.Element | null;
  } => {
    if (error) {
      return {
        innerText: error.reason,
        subTitle: null
      };
    }

    if (loading) {
      return {
        innerText: 'Loading...',
        subTitle: null
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

const getOverallocationPercent = (amountOfCores: number, load: number) => {
  /** we have a negative number meaning we're overallocated */
  const allocation = amountOfCores - load;
  if (allocation < 0) {
    /** turn into a positive number as a percent */
    return Math.round(allocation * 100 * -1);
  }

  return 0;
};

export default LoadGauge;
