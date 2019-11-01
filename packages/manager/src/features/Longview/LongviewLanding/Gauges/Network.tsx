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

const NetworkGauge: React.FC<Props> = props => {
  const [dataHasResolved, markDataResolved] = React.useState<boolean>(false);
  const [networkUsed, setNetworkUsed] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<APIError | undefined>();

  let mounted = true;

  React.useEffect(() => {
    requestStats(props.token, 'getLatestValue', ['network'])
      .then(response => {
        const interfaces = pathOr(
          {},
          ['Network', 'Interface'],
          response
        ) as Record<string, any>;

        if (mounted) {
          setNetworkUsed(generateUsedNetworkAsBytes(interfaces));

          setError(undefined);

          if (!!loading) {
            setLoading(false);
          }

          if (!dataHasResolved) {
            markDataResolved(true);
          }
        }
      })
      .catch(() => {
        /** only set error if we don't already have data */
        if (mounted) {
          if (!dataHasResolved) {
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

  const generateCopy = (): {
    innerText: string;
    subTitle: JSX.Element | null;
  } => {
    if (error) {
      return {
        innerText: error.reason,
        subTitle: (
          <Typography>
            <strong>Network</strong>
          </Typography>
        )
      };
    }

    if (loading) {
      return {
        innerText: 'Loading...',
        subTitle: (
          <Typography>
            <strong>Network</strong>
          </Typography>
        )
      };
    }

    const { value, unit } = generateUnits(networkUsed);

    return {
      innerText: `${value.toFixed(2)} ${unit}/s`,
      subTitle: (
        <React.Fragment>
          <Typography>
            <strong>Network</strong>
          </Typography>
        </React.Fragment>
      )
    };
  };

  /** Thanks to http://www.matisse.net/bitcalc/ */
  const howManyBytesInAGigabit = 134217728;

  return (
    <GaugePercent
      {...baseGaugeProps}
      /* 
        the max here is not meant to act as an actual max 
        but instead just a logical high value.

        This max comes from the product review on Nov 1st, 2019
        where @caker said to make the max network for the gauge
        1 gigabit.
      */
      max={howManyBytesInAGigabit}
      value={networkUsed}
      filledInColor="#4FAD62"
      {...generateCopy()}
    />
  );
};

export default React.memo(NetworkGauge);

interface Units {
  value: number;
  unit: 'Kb' | 'Mb';
}

/**
 * converts bytes to either Kb (Kilobits) or Mb (Megabits)
 * depending on if the Kilobit conversion exceeds 1000.
 *
 * @param networkUsed inbound and outbound traffic in bytes
 */
export const generateUnits = (networkUsed: number): Units => {
  /** Thanks to http://www.matisse.net/bitcalc/ */
  const howManyKilobitsInAByte = 0.0078125;
  const networkUsedToKilobits = networkUsed * howManyKilobitsInAByte;

  if (networkUsedToKilobits <= 1000) {
    return {
      value: networkUsedToKilobits,
      unit: 'Kb'
    };
  } else {
    const howManyMegabitsInAKilobit = 0.0009765625;
    const networkUsedToMegabits =
      networkUsedToKilobits * howManyMegabitsInAKilobit;
    return {
      value: networkUsedToMegabits,
      unit: 'Mb'
    };
  }
};

/*
  What's returned from Network is a bit of an unknown, but assuming that
  there might be multiple interfaces, we might have a payload like so
  
  "Network": {
    "mac_addr": "f2:3c:92:50:4a:65",
    "Interface": {
      "eth0": {
        "rx_bytes": [{
            "y": 145.529060655738,
            "x": 1571837040
        }],
        "tx_bytes": [{
            "x": 1571837040,
            "y": 130.214483060109
        }]
      },
      "somethingElse": Record<string, Stat[]>
    }
  }

  so what we need to do is iterate over all interfaces and then
  inside that iterate over all the nested subkeys such as _tx_bytes_
  and _rx_bytes_

  So what we end up with in the very end is:

  usedInboundNetwork + usedOutboundNetwork
*/
export const generateUsedNetworkAsBytes = (interfaces: Record<string, any>) => {
  return Object.keys(interfaces).reduce((acc, eachInterface) => {
    const thisInterfaceData = interfaces[eachInterface];
    if (!!thisInterfaceData && typeof thisInterfaceData === 'object') {
      acc += Object.keys(thisInterfaceData).reduce(
        (secondAcc, secondElement) => {
          /**
           * secondElement at this point might be
           *
           * [{ x: 1234, y: 1234 }],
           */
          secondAcc += pathOr(0, [0, 'y'], thisInterfaceData[secondElement]);
          return secondAcc;
        },
        0
      );
    }
    return acc;
  }, 0);
};
