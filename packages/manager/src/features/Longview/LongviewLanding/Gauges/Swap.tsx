import { APIError } from 'linode-js-sdk/lib/types';
import { pathOr } from 'ramda';
import * as React from 'react';
import Typography from 'src/components/core/Typography';
import GaugePercent from 'src/components/GaugePercent';
import requestStats from '../../request';
import { baseGaugeProps } from './common';

import { readableBytes } from 'src/utilities/unitConversions';

interface Props {
  lastUpdated: number;
  token: string;
}

const SwapGauge: React.FC<Props> = props => {
  const [memory, setMemory] = React.useState<number>(0);
  const [totalMemory, setTotalMemory] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<APIError | undefined>();

  let mounted = true;

  React.useEffect(() => {
    requestStats(props.token, 'getLatestValue', ['memory'])
      .then(response => {
        /**
         * The likelihood of any of these paths being undefined is a big
         * unknown, so we learn towards safety.
         */
        const free = pathOr<number>(
          0,
          ['Memory', 'swap', 'free', 0, 'y'],
          response
        );
        const used = pathOr<number>(
          0,
          ['Memory', 'swap', 'used', 0, 'y'],
          response
        );

        if (mounted) {
          setError(undefined);
          /**
           * All units come back in KB. We will do our converting in the render methods
           */
          setMemory(used);
          setTotalMemory(used + free);
          if (!!loading) {
            setLoading(false);
          }
        }
      })
      .catch(() => {
        if (mounted) {
          if (!memory) {
            setError({
              reason: 'Error'
            });
          }

          if (!!loading) {
            setLoading(false);
          }
        }
      });

    return () => {
      mounted = false;
    };
  }, [props.lastUpdated]);

  const generateText = (): {
    innerText: string;
    subTitle: string | JSX.Element;
  } => {
    if (loading) {
      return {
        innerText: 'Loading',
        subTitle: (
          <Typography>
            <strong>Swap</strong>
          </Typography>
        )
      };
    }

    if (error) {
      return {
        innerText: 'Error',
        subTitle: (
          <Typography>
            <strong>Swap</strong>
          </Typography>
        )
      };
    }

    /** first convert memory from KB to bytes */
    const usedMemoryToBytes = memory * 1024;

    const convertedUsedMemory = readableBytes(
      /** convert KB to bytes */
      usedMemoryToBytes,
      {
        unit: 'MB'
      }
    );

    const convertedTotalMemory = readableBytes(
      /** convert KB to bytes */
      totalMemory * 1024,
      {
        unit: 'MB'
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
      )
    };
  };

  return (
    <GaugePercent
      {...baseGaugeProps}
      max={totalMemory}
      value={memory}
      filledInColor="#DC4138"
      {...generateText()}
    />
  );
};

export default SwapGauge;
