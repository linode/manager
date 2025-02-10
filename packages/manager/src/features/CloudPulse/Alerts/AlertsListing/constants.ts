import type { TableColumnHeader } from './AlertListReusableTable';

export const AlertListingTableLabelMap = [
  {
    colName: 'Alert Name',
    label: 'label',
  },
  {
    colName: 'Status',
    label: 'status',
  },
  {
    colName: 'Service',
    label: 'service_type',
  },
  {
    colName: 'Created By',
    label: 'created_by',
  },
  {
    colName: 'Last Modified',
    label: 'updated',
  },
];

export const AlertContextualViewTableHeaderMap: TableColumnHeader[] = [
  { columnName: 'Alert Name', label: 'label' },
  { columnName: 'Metric Threshold', label: 'id' },
  { columnName: 'Alert Type', label: 'type' },
];
