import { engineTypeMap } from '../constants';
import { AlertsEngineTypeFilter } from './AlertsEngineTypeFilter';
import { AlertsRegionFilter } from './AlertsRegionFilter';

import type { AlertInstance } from './DisplayAlertResources';
import type {
  AlertAdditionalFilterKey,
  EngineType,
  ServiceColumns,
  ServiceFilterConfig,
} from './types';
import type { AlertServiceType } from '@linode/api-v4';

export const serviceTypeBasedColumns: ServiceColumns<AlertInstance> = {
  '': [
    // default fallback case when service type is empty, in the create flow, until we select a service type it will be empty
    {
      accessor: ({ label }) => label,
      label: 'Resource',
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
      label: 'Resource',
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
      label: 'Resource',
      sortingKey: 'label',
    },
    {
      accessor: ({ region }) => region,
      label: 'Region',
      sortingKey: 'region',
    },
  ],
};

export const serviceToFiltersMap: Record<
  '' | AlertServiceType,
  ServiceFilterConfig[]
> = {
  '': [{ component: AlertsRegionFilter, filterKey: 'region' }], // default to only region for better user experience
  dbaas: [
    { component: AlertsEngineTypeFilter, filterKey: 'engineType' },
    { component: AlertsRegionFilter, filterKey: 'region' },
  ],
  linode: [{ component: AlertsRegionFilter, filterKey: 'region' }], // TODO: Add 'tags' filter in the future
};
export const applicableAdditionalFilterKeys: AlertAdditionalFilterKey[] = [
  'engineType',
];

export const alertAdditionalFilterKeyMap: Record<
  AlertAdditionalFilterKey,
  keyof AlertInstance
> = {
  engineType: 'engineType',
};

export const engineOptions: EngineType[] = [
  {
    id: 'mysql',
    label: 'MySQL',
  },
  {
    id: 'postgresql',
    label: 'PostgreSQL',
  },
];
