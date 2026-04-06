import {
  createDestinations,
  createStreams,
  deleteDestination,
  deleteStream,
  getDestinations,
  getStreams,
  updateDestination,
  updateStream,
  verifyDestination,
} from 'src/mocks/presets/crud/handlers/delivery';

import type { MockPresetCrud } from 'src/mocks/types';

export const deliveryCrudPreset: MockPresetCrud = {
  group: { id: 'Delivery' },
  handlers: [
    getStreams,
    createStreams,
    deleteStream,
    updateStream,
    getDestinations,
    createDestinations,
    deleteDestination,
    updateDestination,
    verifyDestination,
  ],
  id: 'delivery:crud',
  label: 'Delivery CRUD',
};
