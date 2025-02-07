import { engineTypeMap } from '../constants';
import { AlertsEngineTypeFilter } from './AlertsEngineTypeFilter';

import type { AlertsEngineOptionProps } from './AlertsEngineTypeFilter';
import type { AlertInstance } from './DisplayAlertResources';
import type { AlertFilterKey, EngineType, ServiceColumns } from './types';
import type { AlertServiceType } from '@linode/api-v4';
import type { MemoExoticComponent } from 'react';

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
      accessor: ({ region }) => region,
      label: 'Region',
      sortingKey: 'region',
    },
    {
      accessor: ({ engineType }) =>
        engineTypeMap[engineType ?? ''] ?? engineType,
      label: 'Database Engine',
      sortingKey: 'engineType',
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
  MemoExoticComponent<React.ComponentType<AlertsEngineOptionProps>>[]
> = {
  '': [], // default to empty
  dbaas: [AlertsEngineTypeFilter], // dbaas uses Engine filter
  linode: [], // TODO: enhance with a tags filter
};
export const alertApplicableFilterKeys: AlertFilterKey[] = ['engineType'];

export const alertAdditionalFilterKeyMap: Record<
  AlertFilterKey,
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
