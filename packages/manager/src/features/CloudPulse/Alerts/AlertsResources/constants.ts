import { engineTypeMap } from '../constants';
import { AlertsEngineTypeFilter } from './AlertsEngineTypeFilter';
import { AlertsRegionFilter } from './AlertsRegionFilter';

import type { AlertInstance } from './DisplayAlertResources';
import type {
  AlertAdditionalFilterKey,
  ServiceColumns,
  ServiceFilterConfig,
} from './types';
import type { AlertServiceType, DatabaseTypeClass } from '@linode/api-v4';

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
};

export const serviceToFiltersMap: Record<
  '' | AlertServiceType,
  ServiceFilterConfig[]
> = {
  '': [{ component: AlertsRegionFilter, filterKey: 'region' }], // Default to only region for better user experience in create alert flow
  dbaas: [
    { component: AlertsEngineTypeFilter, filterKey: 'engineType' },
    { component: AlertsRegionFilter, filterKey: 'region' },
  ],
  linode: [{ component: AlertsRegionFilter, filterKey: 'region' }],
  firewall: [],
};
export const applicableAdditionalFilterKeys: AlertAdditionalFilterKey[] = [
  'engineType', // Extendable in future for filter keys like 'tags', 'plan', etc.
  'tags',
];

export const alertAdditionalFilterKeyMap: Record<
  AlertAdditionalFilterKey,
  keyof AlertInstance
> = {
  engineType: 'engineType', // engineType filter selected here, will map to engineType property on AlertInstance
  tags: 'tags',
};

export const databaseTypeClassMap: Record<DatabaseTypeClass, string> = {
  dedicated: 'dedicated',
  nanode: 'nanode',
  premium: 'premium',
  standard: 'standard',
};

export const getSearchPlaceholderText = (
  serviceType: AlertServiceType | undefined
): string => {
  const filters = serviceToFiltersMap[serviceType ?? ''] ?? [];

  const hasRegionFilter = filters.some((f) => f.filterKey === 'region');

  if (hasRegionFilter) {
    return 'Search for an Entity or Region';
  }

  return 'Search for an Entity';
};
