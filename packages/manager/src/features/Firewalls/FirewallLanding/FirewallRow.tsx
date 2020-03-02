import { Firewall, FirewallDevice } from 'linode-js-sdk/lib/firewalls';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { compose } from 'recompose';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import useFirewallDevices from 'src/hooks/useFirewallDevices';
import { truncateAndJoinList } from 'src/utilities/stringUtils';
import ActionMenu, { ActionHandlers } from './FirewallActionMenu';

interface Props extends ActionHandlers {
  firewallID: number;
  firewallLabel: string;
  firewallStatus: Firewall['status'];
  firewallRules: Firewall['rules'];
}

export type CombinedProps = Props;

export const FirewallRow: React.FC<CombinedProps> = props => {
  const {
    firewallID,
    firewallLabel,
    firewallStatus,
    firewallRules,
    ...actionHandlers
  } = props;

  const {
    devices: { itemsById, error, loading, lastUpdated },
    requestDevices
  } = useFirewallDevices(firewallID);
  const devices = Object.values(itemsById);

  React.useEffect(() => {
    if (lastUpdated === 0 && !loading) {
      requestDevices();
    }
  }, []);

  const count = getCountOfRules(firewallRules);

  return (
    <TableRow
      key={`firewall-row-${firewallID}`}
      rowLink={`/firewalls/${firewallID}`}
      data-testid={`firewall-row-${firewallID}`}
    >
      <TableCell>{firewallLabel}</TableCell>
      <TableCell>{firewallStatus}</TableCell>
      <TableCell>{getRuleString(count)}</TableCell>
      <TableCell>
        {getLinodesCellString(devices, loading, error.read)}
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

  const deviceLabels = data.map(thisDevice => thisDevice.entity.label);
  return truncateAndJoinList(deviceLabels, 3);
};

export default compose<CombinedProps, Props>(React.memo)(FirewallRow);
