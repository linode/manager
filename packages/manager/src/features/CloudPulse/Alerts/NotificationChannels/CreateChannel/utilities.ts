import type { CreateNotificationChannelForm } from './types';
import type { CreateNotificationChannelPayload } from '@linode/api-v4';

export const filterCreateChannelFormValues = (
  formValues: CreateNotificationChannelForm
): CreateNotificationChannelPayload => {
  return {
    channel_type: formValues.type ?? 'email',
    details: {
      email: {
        usernames: formValues.recipients,
      },
    },
    label: formValues.label,
  };
};
