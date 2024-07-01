/**
 * @file Basic CRUD MSW preset.
 */

import { getEvents, updateEvents } from 'src/mocks/handlers/event-handlers';
import { createLinodes, getLinodes } from 'src/mocks/handlers/linode-handlers';
import {
  createVolumes,
  deleteVolumes,
  getVolumes,
  updateVolumes,
} from 'src/mocks/handlers/volume-handlers';

import type { MockPreset } from 'src/mocks/types';

export const baselineCrudPreset: MockPreset = {
  group: 'General',
  handlers: [
    // Linode CRUD handlers.
    getLinodes,
    createLinodes,

    // Volume CRUD handlers.
    getVolumes,
    createVolumes,
    updateVolumes,
    deleteVolumes,

    // Events.
    getEvents,
    updateEvents,
  ],
  id: 'baseline-crud',
  label: 'Basic CRUD',
};
