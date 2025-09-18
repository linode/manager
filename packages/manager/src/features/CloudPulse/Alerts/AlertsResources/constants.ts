import React from 'react';

import { engineTypeMap } from '../constants';
import { AlertsEndpointFilter } from './AlertsEndpointFilter';
import { AlertsEngineTypeFilter } from './AlertsEngineTypeFilter';
import { AlertsRegionFilter } from './AlertsRegionFilter';
import { AlertsTagFilter } from './AlertsTagsFilter';
import { TextWithExtraInfo } from './TextWithExtraInfo';

import type { AlertInstance } from './DisplayAlertResources';
import type { TextWithInfoProp } from './TextWithExtraInfo';
import type {
  AlertAdditionalFilterKey,
  ServiceColumns,
  ServiceFilterConfig,
} from './types';
import type { CloudPulseServiceType, DatabaseTypeClass } from '@linode/api-v4';

export const serviceTypeBasedColumns: ServiceColumns<AlertInstance> = {
  '': [
    // Default fallback case when service type is empty, in the create flow, until we select a service type it will be empty
    {
      accessor: ({ label }) => label,
      label: 'Entity',
      sortingKey: 'label',
    },
    {
      accessor: ({ region }) => region,
      label: 'Region',
      sortingKey: 'region',
    },
  ],
  dbaas: [
    {
      accessor: ({ label }) => label,
      label: 'Entity',
      sortingKey: 'label',
    },
    {
      accessor: ({ engineType }) =>
        engineTypeMap[engineType ?? ''] ?? engineType,
      label: 'Database Engine',
      sortingKey: 'engineType',
    },
    {
      accessor: ({ region }) => region,
      label: 'Region',
      sortingKey: 'region',
    },
  ],
  linode: [
    {
      accessor: ({ label }) => label,
      label: 'Entity',
      sortingKey: 'label',
    },
    {
      accessor: ({ region }) => region,
      label: 'Region',
      sortingKey: 'region',
    },
  ],
  firewall: [
    {
      accessor: ({ label }) => label,
      label: 'Entity',
      sortingKey: 'label',
    },
  ],
  nodebalancer: [
    {
      accessor: ({ label }) => label,
      label: 'Entity',
      sortingKey: 'label',
    },
    {
      accessor: ({ region }) => region,
      label: 'Region',
      sortingKey: 'region',
    },
    {
      accessor: ({ tags }) =>
        React.createElement<Required<TextWithInfoProp>>(TextWithExtraInfo, {
          values: tags ?? [],
        }),
      label: 'Tags',
      sortingKey: 'tags',
    },
  ],
  objectstorage: [
    {
      accessor: ({ label }) => label,
      label: 'Entity',
      sortingKey: 'label',
    },
    {
      accessor: ({ region }) => region,
      label: 'Region',
      sortingKey: 'region',
    },
    {
      accessor: ({ endpoint }) => endpoint,
      label: 'Endpoint',
      sortingKey: 'endpoint',
    },
  ],
};

export const serviceToFiltersMap: Partial<
  Record<Partial<CloudPulseServiceType>, ServiceFilterConfig[]>
> &
  Record<'', ServiceFilterConfig[]> = {
  '': [{ component: AlertsRegionFilter, filterKey: 'region' }], // Default to only region for better user experience in create alert flow
  dbaas: [
    { component: AlertsEngineTypeFilter, filterKey: 'engineType' },
    { component: AlertsRegionFilter, filterKey: 'region' },
  ],
  linode: [{ component: AlertsRegionFilter, filterKey: 'region' }],
  nodebalancer: [
    { component: AlertsRegionFilter, filterKey: 'region' },
    { component: AlertsTagFilter, filterKey: 'tags' },
  ],
  firewall: [],
  objectstorage: [
    { component: AlertsRegionFilter, filterKey: 'region' },
    { component: AlertsEndpointFilter, filterKey: 'endpoint' },
  ],
};

export const applicableAdditionalFilterKeys: AlertAdditionalFilterKey[] = [
  'endpoint',
  'engineType', // Extendable in future for filter keys like 'tags', 'plan', etc.
  'tags',
];

export const alertAdditionalFilterKeyMap: Record<
  AlertAdditionalFilterKey,
  keyof AlertInstance
> = {
  engineType: 'engineType', // engineType filter selected here, will map to engineType property on AlertInstance
  tags: 'tags',
  endpoint: 'endpoint',
};

export const databaseTypeClassMap: Record<DatabaseTypeClass, string> = {
  dedicated: 'dedicated',
  nanode: 'nanode',
  premium: 'premium',
  standard: 'standard',
};

export const getSearchPlaceholderText = (
  serviceType: CloudPulseServiceType | undefined
): string => {
  const filters = serviceToFiltersMap[serviceType ?? ''] ?? [];

  const hasRegionFilter = filters.some(
    ({ filterKey }) => filterKey === 'region'
  );

  if (hasRegionFilter) {
    return 'Search for a Region or Entity';
  }

  return 'Search for an Entity';
};
