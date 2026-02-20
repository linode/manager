import type { CreateNotificationChannelForm } from '../CreateChannel/types';
import type { EditNotificationChannelPayloadWithId } from '@linode/api-v4';

export const filterEditChannelFormValues = (
  channelId: number,
  formValues: CreateNotificationChannelForm
): EditNotificationChannelPayloadWithId => {
  const usernames = formValues.details.email.usernames;
  return {
    channelId,
    label: formValues.label,
    details: {
      email: {
        usernames,
      },
    },
  };
};
