import { useAllLinodesQuery } from '@linode/queries';
import { capitalize } from '@linode/utilities';
import React from 'react';

import { Hidden } from 'src/components/Hidden';
import { Link } from 'src/components/Link';
import { Skeleton } from 'src/components/Skeleton';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useDefaultFirewallChipInformation } from 'src/hooks/useDefaultFirewallChipInformation';
import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

import { DefaultFirewallChip } from '../components/DefaultFirewallChip';
import { getLinodeIdFromInterfaceDevice } from '../shared';
import { FirewallActionMenu } from './FirewallActionMenu';

import type { ActionHandlers } from './FirewallActionMenu';
import type {
  Filter,
  Firewall,
  FirewallDeviceEntity,
  Linode,
} from '@linode/api-v4';

export interface FirewallRowProps extends Firewall, ActionHandlers {}

export const FirewallRow = React.memo((props: FirewallRowProps) => {
  const { entities, id, label, rules, status, ...actionHandlers } = props;

  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();

  const {
    isDefault,
    numEntitiesIsDefaultFor,
    tooltipText,
  } = useDefaultFirewallChipInformation(id);

  const neededLinodeIdsForInterfaceDevices = entities
    .slice(0, 3) // only take the first three entities since we only show those entity links
    .filter((entity) => entity.type === 'interface')
    .map((entity) => {
      return { id: getLinodeIdFromInterfaceDevice(entity) };
    });

  const filterForInterfaceDeviceLinodes: Filter = {
    ['+or']: neededLinodeIdsForInterfaceDevices,
  };

  // only fire this query if we have linode interface devices. We fetch the Linodes those devices are attached to
  // so that we can add a label to the devices for sorting and display purposes
  const { data: linodesWithInterfaceDevices, isLoading } = useAllLinodesQuery(
    {},
    filterForInterfaceDeviceLinodes,
    isLinodeInterfacesEnabled && neededLinodeIdsForInterfaceDevices.length > 0
  );

  const count = getCountOfRules(rules);

  return (
    <TableRow data-testid={`firewall-row-${id}`}>
      <TableCell>
        <Link tabIndex={0} to={`/firewalls/${id}`}>
          {label}
        </Link>
        {isLinodeInterfacesEnabled && isDefault && (
          <DefaultFirewallChip
            chipProps={{ sx: { marginLeft: 1 } }}
            numEntitiesIsDefaultFor={numEntitiesIsDefaultFor}
            tooltipText={tooltipText}
          />
        )}
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
            isLoading,
            linodesWithInterfaceDevices,
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
  isLoading: boolean;
  linodesWithInterfaceDevices: Linode[] | undefined;
}
const getDevicesCellString = (inputs: DeviceLinkInputs) => {
  const {
    entities,
    isLinodeInterfacesEnabled,
    isLoading,
    linodesWithInterfaceDevices,
  } = inputs;
  const filteredEntities = isLinodeInterfacesEnabled
    ? entities
    : entities.filter((entity) => entity.type !== 'interface');

  if (filteredEntities.length === 0) {
    return 'None assigned';
  }

  return getDeviceLinks({
    entities: filteredEntities,
    isLoading,
    linodesWithInterfaceDevices,
  });
};

export const getDeviceLinks = (
  inputs: Omit<DeviceLinkInputs, 'isLinodeInterfacesEnabled'>
) => {
  const { entities, isLoading, linodesWithInterfaceDevices } = inputs;
  const firstThree = entities.slice(0, 3);

  if (isLoading) {
    return <Skeleton />;
  }

  return (
    <>
      {firstThree.map((entity, idx) => {
        // TODO @Linode Interfaces - switch to parent entity when endpoints are updated
        const isInterfaceDevice = entity.type === 'interface';
        const parentEntityId = isInterfaceDevice // for Linode Interface devices, we also need the Linode ID
          ? getLinodeIdFromInterfaceDevice(entity)
          : entity.id;
        const entityLabel = isInterfaceDevice
          ? linodesWithInterfaceDevices?.find(
              (linode) => linode.id === parentEntityId
            )?.label ?? entity.label
          : entity.label;
        const entityLink = isInterfaceDevice
          ? `/linodes/${parentEntityId}/networking/interfaces/${entity.id}`
          : `/${entity.type}s/${entity.id}/${
              entity.type === 'linode' ? 'networking' : 'summary'
            }`;

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
