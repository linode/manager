import { engineTypeMap } from '../constants';

import type { AlertInstance } from './DisplayAlertResources';

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
