import {
  createPlacementGroup,
  deletePlacementGroup,
  getPlacementGroups,
  placementGroupLinodeAssignment,
  updatePlacementGroup,
} from 'src/mocks/presets/crud/handlers/placementGroups';

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
