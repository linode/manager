import {
  Firewall,
  FirewallDevice,
  getFirewallDevices as _getDevices
} from 'linode-js-sdk/lib/firewalls';
import { APIError } from 'linode-js-sdk/lib/types';
import { take } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';

import TableRow from 'src/components/core/TableRow';
import TableCell from 'src/components/TableCell';

import ActionMenu, { ActionHandlers } from './FirewallActionMenu';

import { devices as mockDevices } from 'src/__data__/firewallDevices';

interface Props extends ActionHandlers {
  firewallID: number;
  firewallLabel: string;
  firewallStatus: Firewall['status'];
  firewallRules: Firewall['rules'];
}

type CombinedProps = Props;

const FirewallRow: React.FC<CombinedProps> = props => {
  const {
    firewallID,
    firewallLabel,
    firewallStatus,
    firewallRules,
    ...actionHandlers
  } = props;

  const [devicesLoading, setDevicesLoading] = React.useState<boolean>(false);
  const [devicesError, setDevicesError] = React.useState<
    APIError[] | undefined
  >(undefined);
  const [devices, setDevices] = React.useState<FirewallDevice[]>([]);

  const getFirewallDevices = () => {
    setDevicesLoading(true);

    _getDevices(1, mockDevices)
      .then(({ data }) => {
        setDevices(data);
        setDevicesLoading(false);
      })
      .catch((e: APIError[]) => {
        setDevicesError(e);
        setDevicesLoading(false);
      });
  };

  React.useEffect(() => {
    getFirewallDevices();
  }, []);

  const count = getCountOfRules(firewallRules);

  return (
    <TableRow key={`firewall-row-${firewallID}`}>
      <TableCell>{firewallLabel}</TableCell>
      <TableCell>{firewallStatus}</TableCell>
      <TableCell>{getRuleString(count)}</TableCell>
      <TableCell>
        {getLinodesCellString(devices, devicesLoading, devicesError)}
      </TableCell>
      <TableCell>
        <ActionMenu
          firewallID={firewallID}
          firewallLabel={firewallLabel}
          firewallStatus={firewallStatus}
          {...actionHandlers}
        />
      </TableCell>
    </TableRow>
  );
};

/**
 *
 * outputs either
 *
 * 1 Inbound / 2 Outbound
 *
 * 1 Inbound
 *
 * 3 Outbound
 */
export const getRuleString = (count: [number, number]) => {
  const [inbound, outbound] = count;

  let string = '';

  if (inbound !== 0 && outbound !== 0) {
    return `${inbound} Inbound / ${outbound} Outbound`;
  } else if (inbound !== 0) {
    string = `${inbound} Inbound`;
  } else if (outbound !== 0) {
    string += `${outbound} Outbound`;
  }
  return string;
};

export const getCountOfRules = (rules: Firewall['rules']): [number, number] => {
  return [(rules.inbound || []).length, (rules.outbound || []).length];
};

const getLinodesCellString = (
  data: FirewallDevice[],
  loading: boolean,
  error?: APIError[]
): string => {
  if (loading) {
    return 'Loading...';
  }

  if (error) {
    return 'Error retrieving Linodes';
  }

  if (data.length === 0) {
    return 'None assigned';
  }

  const howManyDevicesMinusThree = data.length - 3;

  const firstThreeLabels = take(3, data).map(
    (e: FirewallDevice) => e.entity.label
  );

  return howManyDevicesMinusThree > 0
    ? `${firstThreeLabels.join(', ')}, plus ${howManyDevicesMinusThree} more`
    : firstThreeLabels.join(', ');
};

export default compose<CombinedProps, Props>(React.memo)(FirewallRow);
