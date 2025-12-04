import { groupAccountEntitiesByType } from '../utilities';

import type { EntitiesOption } from '../types';
import type { AccessType, AccountEntity, EntityType } from '@linode/api-v4';

type PlaceholderType = 'delegates' | AccessType;

export const placeholderMap: Record<string, string> = {
  account: 'Select Account',
  database: 'Select Databases',
  domain: 'Select Domains',
  firewall: 'Select Firewalls',
  image: 'Select Images',
  linode: 'Select Linodes',
  lkecluster: 'Select Kubernetes Clusters',
  longview: 'Select Longviews',
  nodebalancer: 'Select Nodebalancers',
  placement_group: 'Select Placement Groups',
  stackscript: 'Select Stackscripts',
  volume: 'Select Volumes',
  vpc: 'Select VPCs',
  delegates: 'Select Users',
};

export const getCreateLinkForEntityType = (entityType: AccessType): string => {
  // TODO - find the exceptions to this rule - most use the route of /{entityType}s/create (note the "s")

  if (entityType === 'placement_group') {
    return '/placement-groups/create';
  }

  if (entityType === 'lkecluster') {
    return '/kubernetes/create';
  }

  return `/${entityType}s/create`;
};

export const getPlaceholder = (
  type: PlaceholderType,
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
  roleEntityType: AccessType,
  entities: AccountEntity[]
): Pick<AccountEntity, 'id' | 'label'>[] | undefined => {
  const entitiesMap = groupAccountEntitiesByType(entities);

  // Find the first matching entity by type
  return entitiesMap.get(roleEntityType as EntityType);
};
