import type {
  ChannelType,
  CreateNotificationChannelPayload,
} from '@linode/api-v4';

export interface CreateNotificationChannelForm
  extends Omit<CreateNotificationChannelPayload, 'channel_type'> {
  channel_type: ChannelType | null;
  details: {
    email: {
      usernames: string[];
    };
  };
}
