import type { ChannelType } from '@linode/api-v4';

export interface CreateNotificationChannelForm {
  label: string;
  recipients: string[];
  type: ChannelType | null;
}
