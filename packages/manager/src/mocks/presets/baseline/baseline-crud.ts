/**
 * @file Basic CRUD MSW preset.
 */
import { http } from 'msw';

import { getEvents, updateEvents } from 'src/mocks/handlers/event-handlers';
import { createLinodes, getLinodes } from 'src/mocks/handlers/linode-handlers';
import {
  createPlacementGroup,
  deletePlacementGroup,
  getPlacementGroups,
  placementGroupLinodeAssignment,
  updatePlacementGroup,
} from 'src/mocks/handlers/placementGroup-handlers';
import {
  createVolumes,
  deleteVolumes,
  getVolumes,
  updateVolumes,
} from 'src/mocks/handlers/volume-handlers';

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
    // Linode CRUD handlers.
    getLinodes,
    createLinodes,

    // Placement Group CRUD handlers.
    getPlacementGroups,
    createPlacementGroup,
    updatePlacementGroup,
    deletePlacementGroup,
    placementGroupLinodeAssignment,

    // Volume CRUD handlers.
    getVolumes,
    createVolumes,
    updateVolumes,
    deleteVolumes,

    // Events.
    getEvents,
    updateEvents,

    // Slow down all requests.
    slowDownAllRequests,
  ],
  id: 'baseline-crud',
  label: 'Basic CRUD',
};
