import { capitalize } from '@linode/utilities';
import React from 'react';

import { Hidden } from '@linode/ui';
import { Link } from 'src/components/Link';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import { FirewallActionMenu } from './FirewallActionMenu';

import type { ActionHandlers } from './FirewallActionMenu';
import type { Firewall, FirewallDeviceEntity } from '@linode/api-v4';

export interface FirewallRowProps extends Firewall, ActionHandlers {}

export const FirewallRow = React.memo((props: FirewallRowProps) => {
  const { entities, id, label, rules, status, ...actionHandlers } = props;

  const count = getCountOfRules(rules);

  return (
    <TableRow data-testid={`firewall-row-${id}`}>
      <TableCell>
        <Link tabIndex={0} to={`/firewalls/${id}`}>
          {label}
        </Link>
      </TableCell>
      <TableCell statusCell>
        <StatusIcon status={status === 'enabled' ? 'active' : 'inactive'} />
        {capitalize(status)}
      </TableCell>
      <Hidden smDown>
        <TableCell>{getRuleString(count)}</TableCell>
        <TableCell>{getDevicesCellString(entities)}</TableCell>
      </Hidden>
      <TableCell
        sx={{ paddingRight: 0, textAlign: 'end', whiteSpace: 'nowrap' }}
      >
        <FirewallActionMenu
          firewallID={id}
          firewallLabel={label}
          firewallStatus={status}
          {...actionHandlers}
        />
      </TableCell>
    </TableRow>
  );
});

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
export const getRuleString = (count: [number, number]): string => {
  const [inbound, outbound] = count;

  let string = '';

  if (inbound !== 0 && outbound !== 0) {
    return `${inbound} Inbound / ${outbound} Outbound`;
  } else if (inbound !== 0) {
    string = `${inbound} Inbound`;
  } else if (outbound !== 0) {
    string += `${outbound} Outbound`;
  }
  return string || 'No rules';
};

export const getCountOfRules = (rules: Firewall['rules']): [number, number] => {
  return [(rules.inbound || []).length, (rules.outbound || []).length];
};

const getDevicesCellString = (entities: FirewallDeviceEntity[]) => {
  if (entities.length === 0) {
    return 'None assigned';
  }

  return getDeviceLinks(entities);
};

export const getDeviceLinks = (entities: FirewallDeviceEntity[]) => {
  const firstThree = entities.slice(0, 3);

  return (
    <>
      {firstThree.map((entity, idx) => (
        <React.Fragment key={entity.url}>
          {idx > 0 && ', '}
          <Link
            className="link secondaryLink"
            data-testid="firewall-row-link"
            to={`/${entity.type}s/${entity.id}`}
          >
            {entity.label}
          </Link>
        </React.Fragment>
      ))}
      {entities.length > 3 && <span>, plus {entities.length - 3} more.</span>}
    </>
  );
};
