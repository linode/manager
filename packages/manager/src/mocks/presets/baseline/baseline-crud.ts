/**
 * @file Basic CRUD MSW preset.
 */
import { http } from 'msw';

import { getEvents, updateEvents } from 'src/mocks/handlers/event-handlers';
import { linodeCrudPreset } from 'src/mocks/presets/crud/linodes-crud';

import { placementGroupsCrudPreset } from '../crud/placementGroups-crud';
import { volumeCrudPreset } from '../crud/volumes-crud';

import type { MockPreset } from 'src/mocks/types';

const slowDownAllRequests = () => {
  return [
    http.all('*/v4*/*', async () => {
      // Simulating a 500ms delay for all requests
      // to make the UI feel more realistic (e.g. loading states)
      await new Promise((resolve) => {
        const timer = setTimeout(resolve, 400);
        // Clear the timer if the request is aborted
        // to avoid any potential memory leaks
        return () => clearTimeout(timer);
      });
    }),
  ];
};

export const baselineCrudPreset: MockPreset = {
  group: 'General',
  handlers: [
    ...linodeCrudPreset.handlers,
    ...placementGroupsCrudPreset.handlers,
    ...volumeCrudPreset.handlers,

    // Events.
    getEvents,
    updateEvents,

    // Slow down all requests.
    slowDownAllRequests,
  ],
  id: 'baseline-crud',
  label: 'Basic CRUD',
};
