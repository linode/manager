import type { NotificationChannel } from '@linode/api-v4';

type ChannelListingTableLabel = {
  colName: string;
  label: keyof NotificationChannel;
};

export const ChannelListingTableLabelMap: ChannelListingTableLabel[] = [
  {
    colName: 'Channel Name',
    label: 'label',
  },
  {
    colName: 'Alerts',
    label: 'alerts',
  },
  {
    colName: 'Channel Type',
    label: 'channel_type',
  },
  {
    colName: 'Created By',
    label: 'created_by',
  },
  {
    colName: 'Last Modified',
    label: 'updated',
  },
  {
    colName: 'Last Modified By',
    label: 'updated_by',
  },
];

export const ChannelAlertsTooltipText =
  'The number of alert definitions associated with the notification channel.';
