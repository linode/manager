import {
  addSharegroupImages,
  addSharegroupMembers,
  createSharegroup,
  deleteSharegroup,
  deleteSharegroupImages,
  deleteSharegroupMember,
  deleteSharegroupToken,
  generateSharegroupToken,
  getSharegroupImages,
  getSharegroupMembers,
  getSharegroups,
  getSharegroupTokens,
  updateSharegroup,
  updateSharegroupImage,
  updateSharegroupMember,
  updateSharegroupToken,
} from './handlers/imageSharegroups';

import type { MockPresetCrud } from 'src/mocks/types';

export const imagesCrudPreset: MockPresetCrud = {
  group: { id: 'Image Sharegroups' },
  handlers: [
    getSharegroups,
    getSharegroupImages,
    getSharegroupMembers,
    getSharegroupTokens,
    createSharegroup,
    addSharegroupImages,
    addSharegroupMembers,
    generateSharegroupToken,
    updateSharegroup,
    updateSharegroupImage,
    updateSharegroupMember,
    updateSharegroupToken,
    deleteSharegroup,
    deleteSharegroupImages,
    deleteSharegroupMember,
    deleteSharegroupToken,
  ],
  id: 'imageSharegroups:crud',
  label: 'ImageSharegroups CRUD',
};
