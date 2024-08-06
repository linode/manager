import {
  createPlacementGroup,
  deletePlacementGroup,
  getPlacementGroups,
  placementGroupLinodeAssignment,
  updatePlacementGroup,
} from 'src/mocks/handlers/placementGroup-handlers';

import type { MockPreset } from 'src/mocks/types';

export const placementGroupsCrudPreset: MockPreset = {
  group: 'Placement Groups',
  handlers: [
    createPlacementGroup,
    getPlacementGroups,
    updatePlacementGroup,
    deletePlacementGroup,
    placementGroupLinodeAssignment,
  ],
  id: 'placementGroups-crud',
  label: 'Placement Groups CRUD',
};
