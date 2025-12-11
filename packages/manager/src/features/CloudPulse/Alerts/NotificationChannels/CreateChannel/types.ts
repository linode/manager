import type { ChannelType } from '@linode/api-v4';

export interface CreateNotificationChannelForm {
  name: string;
  type: ChannelType | null;
}
