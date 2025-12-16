import type { ChannelType } from '@linode/api-v4';

export interface CreateNotificationChannelForm {
  name: string;
  recipients: string[];
  type: ChannelType | null;
}
