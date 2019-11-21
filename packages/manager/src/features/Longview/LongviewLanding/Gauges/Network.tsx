import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import { WithTheme, withTheme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import GaugePercent from 'src/components/GaugePercent';
import withClientStats, {
  Props as LVDataProps
} from 'src/containers/longview.stats.container';
import { LongviewNetwork } from '../../request.types';
import { baseGaugeProps, BaseProps as Props } from './common';

type CombinedProps = Props & LVDataProps & WithTheme;

const NetworkGauge: React.FC<CombinedProps> = props => {
  const {
    longviewClientDataLoading: loading,
    longviewClientDataError: error,
    longviewClientData,
    lastUpdatedError
  } = props;

  const networkUsed = generateUsedNetworkAsBytes(
    pathOr({}, ['Network', 'Interface'], longviewClientData)
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
      innerText: `${value} ${unit}/s`,
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
      filledInColor={props.theme.graphs.green}
      {...generateCopy()}
    />
  );
};

export default compose<CombinedProps, Props>(
  React.memo,
  withClientStats<Props>(ownProps => ownProps.clientID),
  withTheme
)(NetworkGauge);

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
  const networkUsedToKilobits = (networkUsed * 8) / 1024;

  if (networkUsedToKilobits <= 1000) {
    return {
      value: Math.round(networkUsedToKilobits),
      unit: 'Kb'
    };
  } else {
    return {
      value: Math.round(networkUsedToKilobits / 1024),
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
          secondAcc += pathOr(0, [0, 'y'], secondElement);
          return secondAcc;
        },
        0
      );
    }
    return acc;
  }, 0);
};
