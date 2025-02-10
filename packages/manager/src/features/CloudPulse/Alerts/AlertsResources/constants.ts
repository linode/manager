import { engineTypeMap } from '../constants';
import { AlertsEngineTypeFilter } from './AlertsEngineTypeFilter';
import { AlertsRegionFilter } from './AlertsRegionFilter';

import type { AlertsEngineOptionProps } from './AlertsEngineTypeFilter';
import type { AlertsRegionProps } from './AlertsRegionFilter';
import type { AlertInstance } from './DisplayAlertResources';
import type { AlertAdditionalFilterKey, ServiceFilterConfig } from './types';
import type { AlertServiceType } from '@linode/api-v4';
import type { MemoExoticComponent } from 'react';

interface ColumnConfig<T> {
  accessor: (data: T) => string;
  label: string;
  sortingKey?: keyof T;
}

type ServiceColumns<T> = Record<'' | AlertServiceType, ColumnConfig<T>[]>;

export const serviceTypeBasedColumns: ServiceColumns<AlertInstance> = {
  '': [
    // for empty case lets display resource and region
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
  '': [], // default to empty
  dbaas: [
    { component: AlertsEngineTypeFilter, filter: 'engineType' },
    { component: AlertsRegionFilter, filter: 'region' },
  ],
  linode: [{ component: AlertsRegionFilter, filter: 'region' }], // TODO: Add 'tags' filter in the future
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
