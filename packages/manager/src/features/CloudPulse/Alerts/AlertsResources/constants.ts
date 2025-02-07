import { engineTypeMap } from '../constants';
import { AlertsEngineTypeFilter } from './AlertsEngineTypeFilter';

import type { AlertsEngineOptionProps } from './AlertsEngineTypeFilter';
import type { AlertInstance } from './DisplayAlertResources';
import type { AlertFilterKey, ServiceColumns } from './types';
import type { MemoExoticComponent } from 'react';

export const serviceTypeBasedColumns: ServiceColumns<AlertInstance> = {
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
  string,
  MemoExoticComponent<React.ComponentType<AlertsEngineOptionProps>>[]
> = {
  dbaas: [AlertsEngineTypeFilter], // dbaas uses Engine filter
};
export const alertApplicableFilterKeys: AlertFilterKey[] = ['engineType'];

export const alertAdditionalFilterKeyMap: Record<
  AlertFilterKey,
  keyof AlertInstance
> = {
  engineType: 'engineType',
};
