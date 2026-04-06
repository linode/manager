import { http } from 'msw';

import { makeResourcePage } from 'src/mocks/serverHandlers';
import { makeResponse } from 'src/mocks/utilities/response';

import type { Notification } from '@linode/api-v4';
import type { MockPresetExtra } from 'src/mocks/types';

let customNotificationData: Notification[] | null = null;

export const setCustomNotificationsData = (data: Notification[] | null) => {
  customNotificationData = data;
};

const mockCustomNotifications = () => {
  return [
    http.get('*/v4*/account/notifications', async () => {
      return makeResponse(makeResourcePage(customNotificationData ?? []));
    }),
  ];
};

export const customNotificationsPreset: MockPresetExtra = {
  desc: 'Custom Notifications',
  group: { id: 'Notifications', type: 'notifications' },
  handlers: [mockCustomNotifications],
  id: 'notifications:custom',
  label: 'Custom Notifications',
};
