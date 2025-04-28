import { groupAccountEntitiesByType } from '../utilities';

import type { EntitiesOption } from '../types';
import type {
  AccountEntity,
  EntityType,
  EntityTypePermissions,
} from '@linode/api-v4';

export const placeholderMap: Record<string, string> = {
  account: 'Select Account',
  database: 'Select Databases',
  domain: 'Select Domains',
  firewall: 'Select Firewalls',
  image: 'Select Images',
  linode: 'Select Linodes',
  longview: 'Select Longviews',
  nodebalancer: 'Select Nodebalancers',
  stackscript: 'Select Stackscripts',
  volume: 'Select Volumes',
  vpc: 'Select VPCs',
};

export const getCreateLinkForEntityType = (
  entityType: EntityType | EntityTypePermissions
): string => {
  // TODO - find the exceptions to this rule - most use the route of /{entityType}s/create (note the "s")
  return `/${entityType}s/create`;
};

export const getPlaceholder = (
  type: EntityType | EntityTypePermissions,
  currentValueLength: number,
  possibleEntitiesLength: number
): string => {
  let placeholder: string;

  if (currentValueLength > 0) {
    placeholder = ' ';
  } else if (possibleEntitiesLength === 0) {
    placeholder = 'None';
  } else {
    placeholder = placeholderMap[type] || 'Select';
  }

  return placeholder;
};

export const mapEntitiesToOptions = (
  entities: { id: number; label: string }[]
): EntitiesOption[] => {
  return entities.map((entity) => ({
    label: entity.label,
    value: entity.id,
  }));
};

export const getEntitiesByType = (
  roleEntityType: EntityType | EntityTypePermissions,
  entities: AccountEntity[]
): Pick<AccountEntity, 'id' | 'label'>[] | undefined => {
  const entitiesMap = groupAccountEntitiesByType(entities);

  // Find the first matching entity by type
  return entitiesMap.get(roleEntityType as EntityType);
};
