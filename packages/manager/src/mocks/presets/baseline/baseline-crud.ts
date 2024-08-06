import { getEvents, updateEvents } from 'src/mocks/handlers/event-handlers';
import { linodeCrudPreset } from 'src/mocks/presets/crud/linodes-crud';

import { placementGroupsCrudPreset } from '../crud/placementGroups-crud';
import { volumeCrudPreset } from '../crud/volumes-crud';

import type { MockPreset } from 'src/mocks/types';

export const baselineCrudPreset: MockPreset = {
  group: 'General',
  handlers: [
    ...linodeCrudPreset.handlers,
    ...placementGroupsCrudPreset.handlers,
    ...volumeCrudPreset.handlers,

    // Events.
    getEvents,
    updateEvents,
  ],
  id: 'baseline-crud',
  label: 'CRUD',
};
