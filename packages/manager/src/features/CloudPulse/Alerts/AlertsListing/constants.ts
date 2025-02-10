import type {
  AlertStatusType,
  AlertStatusUpdateAction,
} from '../../../../../../api-v4/lib/cloudpulse/types';

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
  AlertStatusUpdateAction
> = {
  disabled: 'Enable',
  enabled: 'Disable',
};
