import { engineTypeMap } from '../constants';
import { AlertsEngineOptionFilter } from './AlertsEngineTypeFilter';

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

export const serviceFiltersMap: Record<
  string,
  MemoExoticComponent<React.ComponentType<AlertsEngineOptionProps>>[]
> = {
  dbaas: [AlertsEngineOptionFilter], // dbaas uses Engine filter
};

export type AlertFilterKeys = 'engineType';

export type AlertFilterType = boolean | number | string | undefined;

export const alertApplicableFilterKeys: AlertFilterKeys[] = ['engineType'];

export const alertAdditionalFilterKeyMap: Record<
  AlertFilterKeys,
  keyof AlertInstance
> = {
  engineType: 'engineType',
};
