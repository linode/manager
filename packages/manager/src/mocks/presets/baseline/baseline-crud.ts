/**
 * @file Basic CRUD MSW preset.
 */
import { http } from 'msw';

import { getEvents, updateEvents } from 'src/mocks/handlers/event-handlers';
import { linodeCrudPreset } from 'src/mocks/presets/extra/linodes/linodes-crud';

import { placementGroupsCrudPreset } from '../extra/placementGroups/placementGroups-crud';
import { regionsCrudPreset } from '../extra/regions/regions-crud';
import { volumeCrudPreset } from '../extra/volumes/volumes-crud';

import type { MockPreset } from 'src/mocks/types';

const slowDownAllRequests = () => {
  return [
    http.all('*/v4*/*', async () => {
      // Simulating a 500ms delay for all requests
      // to make the UI feel more realistic (e.g. loading states)
      await new Promise((resolve) => setTimeout(resolve, 500));
    }),
  ];
};

export const baselineCrudPreset: MockPreset = {
  group: 'General',
  handlers: [
    ...linodeCrudPreset.handlers,
    ...placementGroupsCrudPreset.handlers,
    ...regionsCrudPreset.handlers,
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
