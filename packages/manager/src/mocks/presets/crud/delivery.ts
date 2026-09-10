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
import { getQuotas } from 'src/mocks/presets/crud/handlers/quotas';

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
    getQuotas,
  ],
  id: 'delivery:crud',
  label: 'Delivery CRUD',
};
