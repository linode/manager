import { APIError } from 'linode-js-sdk/lib/types';
import { pathOr } from 'ramda';
import * as React from 'react';
import Typography from 'src/components/core/Typography';
import GaugePercent from 'src/components/GaugePercent';
import requestStats from '../../request';
import { baseGaugeProps } from './common';

import { readableBytes } from 'src/utilities/unitConversions';

interface Props {
  lastUpdated?: number;
  token: string;
}

const RAMGauge: React.FC<Props> = props => {
  const [dataHasResolvedAtLeastOnce, setDataResolved] = React.useState<boolean>(
    false
  );
  const [memory, setMemory] = React.useState<number>(0);
  const [totalMemory, setTotalMemory] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<APIError | undefined>();

  React.useEffect(() => {
    let mounted = true;

    requestStats(props.token, 'getLatestValue', ['memory'])
      .then(response => {
        /**
         * The likelihood of any of these paths being undefined is a big
         * unknown, so we learn towards safety.
         */
        const free = pathOr<number>(
          0,
          ['Memory', 'real', 'free', 0, 'y'],
          response
        );
        const used = pathOr<number>(
          0,
          ['Memory', 'real', 'used', 0, 'y'],
          response
        );
        const buffers = pathOr<number>(
          0,
          ['Memory', 'real', 'buffers', 0, 'y'],
          response
        );
        const cache = pathOr<number>(
          0,
          ['Memory', 'real', 'cache', 0, 'y'],
          response
        );

        if (mounted) {
          setError(undefined);
          /**
           * All units come back in KB. We will do our converting in the render methods
           */
          setMemory(generateUsedMemory(used, buffers, cache));
          setTotalMemory(generateTotalMemory(used, free));
          if (!!loading) {
            setLoading(false);
          }
          if (!dataHasResolvedAtLeastOnce) {
            setDataResolved(true);
          }
        }
      })
      .catch(() => {
        if (mounted) {
          if (!dataHasResolvedAtLeastOnce) {
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
            <strong>RAM</strong>
          </Typography>
        )
      };
    }

    if (error) {
      return {
        innerText: 'Error',
        subTitle: (
          <Typography>
            <strong>RAM</strong>
          </Typography>
        )
      };
    }

    /** first convert memory from KB to bytes */
    const usedMemoryToBytes = memory * 1024;
    const howManyBytesInGB = 1073741824;

    const convertedUsedMemory = readableBytes(
      /** convert KB to bytes */
      usedMemoryToBytes,
      {
        unit: usedMemoryToBytes > howManyBytesInGB ? 'GB' : 'MB'
      }
    );

    const convertedTotalMemory = readableBytes(
      /** convert KB to bytes */
      totalMemory * 1024,
      {
        unit: 'GB'
      }
    );

    return {
      innerText: `${convertedUsedMemory.value} ${convertedUsedMemory.unit}`,
      subTitle: (
        <React.Fragment>
          <Typography>
            <strong>RAM</strong>
          </Typography>
          <Typography>{`${convertedTotalMemory.value} GB`}</Typography>
        </React.Fragment>
      )
    };
  };

  return (
    <GaugePercent
      {...baseGaugeProps}
      max={totalMemory}
      value={memory}
      filledInColor="#D38ADB"
      {...generateText()}
    />
  );
};

export const generateUsedMemory = (
  used: number,
  buffers: number,
  cache: number
) => {
  /**
   * calculation comes from original implementation of Longview.JS
   */
  const result = used - (buffers + cache);
  return result < 0 ? 0 : result;
};

export const generateTotalMemory = (used: number, free: number) => used + free;

export default RAMGauge;
