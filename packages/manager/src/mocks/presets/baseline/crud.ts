import {
  getEvents,
  updateEvents,
} from 'src/mocks/presets/crud/handlers/events';
import { linodeCrudPreset } from 'src/mocks/presets/crud/linodes';

import { placementGroupsCrudPreset } from '../crud/placementGroups';
import { volumeCrudPreset } from '../crud/volumes';

import type { MockPresetBaseline } from 'src/mocks/types';

export const baselineCrudPreset: MockPresetBaseline = {
  group: { id: 'General' },
  handlers: [
    ...linodeCrudPreset.handlers,
    ...placementGroupsCrudPreset.handlers,
    ...volumeCrudPreset.handlers,

    // Events.
    getEvents,
    updateEvents,
  ],
  id: 'baseline:crud',
  label: 'CRUD',
};
