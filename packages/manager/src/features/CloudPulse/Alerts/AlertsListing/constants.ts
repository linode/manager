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
};
