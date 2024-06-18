/**
 * @file Basic CRUD MSW preset.
 */

import { getEvents, updateEvents } from 'src/mocks/handlers/event-handlers';
import type { MockPreset } from '../../mockPreset';
import { getLinodes, createLinodes } from 'src/mocks/handlers/linode-handlers';
import {
  createVolumes,
  deleteVolumes,
  getVolumes,
  updateVolumes,
} from 'src/mocks/handlers/volume-handlers';

export const baselineCrudPreset: MockPreset = {
  label: 'Basic CRUD',
  id: 'baseline-crud',
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
};
