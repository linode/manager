import { engineTypeMap } from '../constants';
import { AlertsEngineTypeFilter } from './AlertsEngineTypeFilter';

import type { AlertsEngineOptionProps } from './AlertsEngineTypeFilter';
import type { AlertInstance } from './DisplayAlertResources';
import type { MemoExoticComponent } from 'react';

interface ColumnConfig<T> {
  accessor: (data: T) => string;
  label: string;
  sortingKey?: keyof T;
}

type ServiceColumns<T> = Record<string, ColumnConfig<T>[]>;

export const serviceTypeBasedColumns: ServiceColumns<AlertInstance> = {
  '': [ // for empty case lets display resource and region
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
  string,
  MemoExoticComponent<React.ComponentType<AlertsEngineOptionProps>>[]
> = {
  dbaas: [AlertsEngineTypeFilter], // dbaas uses Engine filter
};

export type AlertFilterKey = 'engineType'; // will be extended to have tags, plan etc.,

export type AlertFilterType = boolean | number | string | undefined;

export const alertApplicableFilterKeys: AlertFilterKey[] = ['engineType'];

export const alertAdditionalFilterKeyMap: Record<
  AlertFilterKey,
  keyof AlertInstance
> = {
  engineType: 'engineType',
};
