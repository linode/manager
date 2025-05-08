import { Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import { compose } from 'recompose';

import { GaugePercent } from 'src/components/GaugePercent/GaugePercent';
import withClientStats from 'src/containers/longview.stats.container';

import {
  convertNetworkToUnit,
  generateNetworkUnits,
} from '../../shared/utilities';
import { baseGaugeProps } from './common';

import type { LongviewNetwork } from '../../request.types';
import type { BaseProps as Props } from './common';
import type { Props as LVDataProps } from 'src/containers/longview.stats.container';

interface NetworkProps extends Props, LVDataProps {}

const Network = (props: NetworkProps) => {
  const {
    lastUpdatedError,
    longviewClientData,
    longviewClientDataError: error,
    longviewClientDataLoading: loading,
  } = props;

  const theme = useTheme();

  const networkUsed = generateUsedNetworkAsBytes(
    longviewClientData?.Network?.Interface ?? {}
  );

  const generateCopy = (): {
    innerText: string;
    subTitle: JSX.Element | null;
  } => {
    // if (error || lastUpdatedError) {
    //   return {
    //     innerText: 'Error',
    //     subTitle: (
    //       <Typography>
    //         <strong>Network</strong>
    //       </Typography>
    //     ),
    //   };
    // }

    // if (loading) {
    //   return {
    //     innerText: 'Loading...',
    //     subTitle: (
    //       <Typography>
    //         <strong>Network</strong>
    //       </Typography>
    //     ),
    //   };
    // }

    /**
     * This logic is to match the values displayed
     * in the gauges in Classic. They're rounded to the nearest
     * unit, whereas elsewhere (in graphs) we use two digits.
     *
     * We also convert from bytes to bits to use our existing
     * utilities to calculate units.
     */
    const networkUsedInBits = networkUsed * 8;
    const unit = generateNetworkUnits(networkUsedInBits);
    const value = Math.round(convertNetworkToUnit(networkUsedInBits, unit));

    return {
      innerText: `88 Kb/s`,
      subTitle: (
        <Typography>
          <strong>Network</strong>
        </Typography>
      ),
    };
  };

  /** Thanks to http://www.matisse.net/bitcalc/ */
  const howManyBytesInAGigabit = 134217728;

  return (
    <GaugePercent
      {...baseGaugeProps}
      filledInColor={theme.graphs.green}
      /*
        the max here is not meant to act as an actual max
        but instead just a logical high value.

        This max comes from the product review on Nov 1st, 2019
        where @caker said to make the max network for the gauge
        1 gigabit.
      */
      max={howManyBytesInAGigabit}
      value={1466148}
      {...generateCopy()}
    />
  );
};

export const NetworkGauge = compose<NetworkProps, Props>(
  React.memo,
  withClientStats<Props>((ownProps) => ownProps.clientID)
)(Network);

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
export const generateUsedNetworkAsBytes = (
  interfaces: LongviewNetwork['Network']['Interface']
) => {
  return Object.values(interfaces).reduce((acc, inboundAndOutBoundBytes) => {
    if (typeof inboundAndOutBoundBytes === 'object') {
      acc += Object.values(inboundAndOutBoundBytes).reduce(
        (secondAcc, secondElement) => {
          /**
           * secondElement at this point might be
           *
           * [{ x: 1234, y: 1234 }],
           */
          secondAcc += secondElement?.[0]?.y ?? 0;
          return secondAcc;
        },
        0
      );
    }
    return acc;
  }, 0);
};
