import {
  createSubnet,
  createVPC,
  deleteSubnet,
  deleteVPC,
  getVPCs,
  updateSubnet,
  updateVPC,
} from './handlers/vpcs';

import type { MockPresetCrud } from 'src/mocks/types';

export const vpcCrudPreset: MockPresetCrud = {
  group: { id: 'VPCs' },
  handlers: [
    createVPC,
    createSubnet,
    deleteSubnet,
    deleteVPC,
    getVPCs,
    updateSubnet,
    updateVPC,
  ],
  id: 'vpcs:crud',
  label: 'VPC CRUD',
};
