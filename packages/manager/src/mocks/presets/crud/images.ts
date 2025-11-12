import {
  createImage,
  deleteImage,
  getImages,
  updateImage,
  updateImageRegions,
} from './handlers/images';

import type { MockPresetCrud } from 'src/mocks/types';

export const imagesCrudPreset: MockPresetCrud = {
  group: { id: 'Images' },
  handlers: [
    createImage,
    deleteImage,
    getImages,
    updateImage,
    updateImageRegions,
  ],
  id: 'images:crud',
  label: 'Images CRUD',
};
