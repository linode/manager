import { http, HttpResponse } from 'msw';

import { makeResourcePage } from 'src/mocks/serverHandlers';

import type { Event } from '@linode/api-v4';
import type { MockPresetExtra } from 'src/mocks/types';

let customEventsData: Event[] | null = null;

export const setCustomEventsData = (data: Event[] | null) => {
  customEventsData = data;
};

const mockCustomEvents = () => {
  return [
    http.get('*/account/events', () => {
      return HttpResponse.json(makeResourcePage(customEventsData ?? []));
    }),
  ];
};

export const customEventsPreset: MockPresetExtra = {
  desc: 'Custom Events',
  group: { id: 'Events', type: 'events' },
  handlers: [mockCustomEvents],
  id: 'events:custom',
  label: 'Custom Events',
};
