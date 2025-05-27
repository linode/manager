import { Box } from '@linode/ui';
import { Hidden } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import React from 'react';

import { Link } from 'src/components/Link';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useDefaultFirewallChipInformation } from 'src/hooks/useDefaultFirewallChipInformation';
import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

import { DefaultFirewallChip } from '../components/DefaultFirewallChip';
import { FirewallActionMenu } from './FirewallActionMenu';

import type { ActionHandlers } from './FirewallActionMenu';
import type { Firewall, FirewallDeviceEntity } from '@linode/api-v4';

export interface FirewallRowProps extends Firewall, ActionHandlers {}

export const FirewallRow = React.memo((props: FirewallRowProps) => {
  const { entities, id, label, rules, status, ...actionHandlers } = props;

  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();

  const { defaultNumEntities, isDefault, tooltipText } =
    useDefaultFirewallChipInformation(id);

  const count = getCountOfRules(rules);

  return (
    <TableRow data-testid={`firewall-row-${id}`}>
      <TableCell>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          <Link tabIndex={0} to={`/firewalls/${id}`}>
            {label}
          </Link>
          {isLinodeInterfacesEnabled && isDefault && (
            <DefaultFirewallChip
              chipProps={{ sx: { marginLeft: 1 } }}
              defaultNumEntities={defaultNumEntities}
              tooltipText={tooltipText}
            />
          )}
        </Box>
      </TableCell>
      <TableCell statusCell>
        <StatusIcon status={status === 'enabled' ? 'active' : 'inactive'} />
        {capitalize(status)}
      </TableCell>
      <Hidden smDown>
        <TableCell>{getRuleString(count)}</TableCell>
        <TableCell>
          {getDevicesCellString({
            entities,
            isLinodeInterfacesEnabled,
          })}
        </TableCell>
      </Hidden>
      <TableCell
        sx={{ paddingRight: 0, textAlign: 'end', whiteSpace: 'nowrap' }}
      >
        <FirewallActionMenu
          firewallID={id}
          firewallLabel={label}
          firewallStatus={status}
          isDefaultFirewall={isDefault}
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

interface DeviceLinkInputs {
  entities: FirewallDeviceEntity[];
  isLinodeInterfacesEnabled: boolean;
}
const getDevicesCellString = (inputs: DeviceLinkInputs) => {
  const { entities, isLinodeInterfacesEnabled } = inputs;
  const filteredEntities = isLinodeInterfacesEnabled
    ? entities
    : entities.filter((entity) => entity.type !== 'interface');

  if (filteredEntities.length === 0) {
    return 'None assigned';
  }

  return getDeviceLinks({
    entities: filteredEntities,
  });
};

export const getDeviceLinks = (
  inputs: Omit<DeviceLinkInputs, 'isLinodeInterfacesEnabled'>
) => {
  const { entities } = inputs;
  const firstThree = entities.slice(0, 3);

  return (
    <>
      {firstThree.map((entity, idx) => {
        const { parent_entity, type, label, id } = entity;
        const isInterfaceDevice = type === 'interface';
        const entityLabel =
          isInterfaceDevice && parent_entity ? parent_entity.label : label;
        const entityLink =
          isInterfaceDevice && parent_entity
            ? `/linodes/${parent_entity.id}/networking/interfaces/${id}`
            : `/${type}s/${id}/${type === 'linode' ? 'networking' : 'summary'}`;

        return (
          <React.Fragment key={entity.url}>
            {idx > 0 && ', '}
            <Link
              className="link secondaryLink"
              data-testid="firewall-row-link"
              to={entityLink}
            >
              {entityLabel}
            </Link>
          </React.Fragment>
        );
      })}
      {entities.length > 3 && <span>, plus {entities.length - 3} more.</span>}
    </>
  );
};
