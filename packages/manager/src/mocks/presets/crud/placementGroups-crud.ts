import {
  createPlacementGroup,
  deletePlacementGroup,
  getPlacementGroups,
  placementGroupLinodeAssignment,
  updatePlacementGroup,
} from 'src/mocks/handlers/placementGroup-handlers';

import type { MockPresetCrud } from 'src/mocks/types';

export const placementGroupsCrudPreset: MockPresetCrud = {
  group: { id: 'Placement Groups' },
  handlers: [
    createPlacementGroup,
    getPlacementGroups,
    updatePlacementGroup,
    deletePlacementGroup,
    placementGroupLinodeAssignment,
  ],
  id: 'placement-groups:crud',
  label: 'Placement Groups CRUD',
};
