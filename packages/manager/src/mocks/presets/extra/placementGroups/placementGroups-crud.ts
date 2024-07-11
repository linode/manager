import {
  createPlacementGroup,
  deletePlacementGroup,
  getPlacementGroups,
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
  ],
  id: 'placementGroups-crud',
  label: 'Placement Groups CRUD',
};
