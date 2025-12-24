import type { CreateNotificationChannelForm } from '../CreateChannel/types';
import type { EditNotificationChannelPayloadWithId } from '@linode/api-v4';

export const filterEditChannelFormValues = (
  channelId: string,
  formValues: CreateNotificationChannelForm
): EditNotificationChannelPayloadWithId => {
  return {
    channelId: Number(channelId),
    label: formValues.name,
    details: {
      email: {
        usernames: formValues.recipients,
      },
    },
  };
};
