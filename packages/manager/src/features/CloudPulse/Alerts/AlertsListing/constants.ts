import type { TableColumnHeader } from '../ContextualView/AlertInformationActionTable';
import type { AlertStatusType, AlertStatusUpdateType } from '@linode/api-v4';

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

export const statusToActionMap: Record<
  AlertStatusType,
  AlertStatusUpdateType
> = {
  disabled: 'Enable',
  enabled: 'Disable',
  failed: 'Disable',
  'in progress': 'Disable',
};

export const AlertContextualViewTableHeaderMap: TableColumnHeader[] = [
  { columnName: 'Alert Name', label: 'label' },
  { columnName: 'Metric Threshold', label: 'id' },
  { columnName: 'Alert Type', label: 'type' },
];
