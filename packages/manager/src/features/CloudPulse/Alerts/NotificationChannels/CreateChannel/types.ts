import type { ChannelType } from '@linode/api-v4';

export interface CreateNotificationChannelForm {
  name: string;
  recipients: null | string[];
  type: ChannelType | null;
}
