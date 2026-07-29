import { groupAccountEntitiesByType } from '../utilities';

import type { EntitiesOption } from '../types';
import type { AccessType, AccountEntity, EntityType } from '@linode/api-v4';

type PlaceholderType = 'delegates' | AccessType;

export const placeholderMap: Record<string, string> = {
  account: 'Search Account',
  database: 'Search Databases',
  domain: 'Search Domains',
  firewall: 'Search Firewalls',
  image: 'Search Images',
  linode: 'Search Linodes',
  lkecluster: 'Search Kubernetes Clusters',
  longview: 'Search Longviews',
  nodebalancer: 'Search Nodebalancers',
  placement_group: 'Search Placement Groups',
  stackscript: 'Search Stackscripts',
  volume: 'Search Volumes',
  vpc: 'Search VPCs',
  delegates: 'Search users',
  mysql_database: 'Search MySQL Databases',
  postgresql_database: 'Search PostgreSQL Databases',
  valkey_database: 'Search Valkey Databases',
};

export const getCreateLinkForEntityType = (entityType: AccessType): string => {
  // TODO - find the exceptions to this rule - most use the route of /{entityType}s/create (note the "s")

  if (entityType === 'placement_group') {
    return '/placement-groups/create';
  }

  if (entityType === 'lkecluster') {
    return '/kubernetes/create';
  }

  if (entityType.includes('database')) {
    return '/databases/create';
  }

  return `/${entityType}s/create`;
};

export const getPlaceholder = (
  type: PlaceholderType,
  currentValueLength: number,
  possibleEntitiesLength: number
): string => {
  if (possibleEntitiesLength === 0) {
    return 'None';
  }

  if (currentValueLength > 0 && currentValueLength >= possibleEntitiesLength) {
    const label = placeholderMap[type] || type;
    const subject = label.startsWith('Search ') ? label.slice(7) : label;
    return `All ${subject} selected`;
  }

  return placeholderMap[type] || 'Search';
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
