/**
 * @file Basic CRUD MSW preset.
 */

import { getEvents, updateEvents } from 'src/mocks/handlers/event-handlers';
import { createLinodes, getLinodes } from 'src/mocks/handlers/linode-handlers';
import {
  createPlacementGroup,
  deletePlacementGroup,
  getPlacementGroups,
  updatePlacementGroup,
} from 'src/mocks/handlers/placementGroup-handlers';
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

    // Placement Group CRUD handlers.
    getPlacementGroups,
    createPlacementGroup,
    updatePlacementGroup,
    deletePlacementGroup,

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
