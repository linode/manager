import type { ChannelType } from '@linode/api-v4';

export interface CreateNotificationChannelForm {
  name: null | string;
  type: ChannelType | null;
}
