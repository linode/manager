import { List, ListItem, Stack, Typography } from '@linode/ui';
import React from 'react';

import type { FirewallSettings } from '@linode/api-v4';

export type FirewallDefaultEntity = keyof FirewallSettings['default_firewall_ids'];

/**
 * Maps an entity that supports default firewalls to a readable name.
 */
export const FIREWALL_DEFAULT_ENTITY_TO_READABLE_NAME: Record<
  FirewallDefaultEntity,
  string
> = {
  linode: 'Configuration Profile Interfaces',
  nodebalancer: 'NodeBalancers',
  public_interface: 'Public (Linode Interfaces)',
  vpc_interface: 'VPC (Linode Interfaces)',
};

/**
 * getEntitiesThatFirewallIsDefaultFor
 *
 * @param firewallId The ID of the Firewall
 * @param firewallSettings The account FirewallSettings from the API
 *
 * @returns An array of entities that this Firewall is a default for.
 * @example ['nodebalancer', 'vpc_interface']
 */
export function getEntitiesThatFirewallIsDefaultFor(
  firewallId: number,
  firewallSettings: FirewallSettings
) {
  const defaultFor: FirewallDefaultEntity[] = [];

  for (const key in firewallSettings.default_firewall_ids) {
    const entity = key as FirewallDefaultEntity;
    if (firewallSettings.default_firewall_ids[entity] === firewallId) {
      defaultFor.push(entity);
    }
  }

  return defaultFor;
}

/**
 * getDefaultFirewallDescription
 *
 * @param firewallId The ID of the Firewall
 * @param firewallSettings The account FirewallSettings from the API
 *
 * @returns A human readable list that explains what entities this Firewall is a default for.
 *          It will return `null` if this Firewall is not a default for anything.
 */
export function getDefaultFirewallDescription(
  firewallId: number,
  firewallSettings: FirewallSettings
) {
  const entitiesThatFirewallIsDefaultFor = getEntitiesThatFirewallIsDefaultFor(
    firewallId,
    firewallSettings
  );

  if (entitiesThatFirewallIsDefaultFor.length === 0) {
    // This means that a Firewall is not a default.
    return null;
  }

  const readableEntities = entitiesThatFirewallIsDefaultFor.map(
    (entity) => FIREWALL_DEFAULT_ENTITY_TO_READABLE_NAME[entity]
  );

  return (
    <Stack>
      <Typography>Default Firewall for:</Typography>
      <List sx={{ listStyleType: 'disc', pl: 3 }}>
        {readableEntities.map((entity) => (
          <ListItem disablePadding key={entity} sx={{ display: 'list-item' }}>
            {entity}
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
