/**
 * @file Basic CRUD MSW preset.
 */

import type { MockPreset } from '../../mockPreset';
import { getLinodes, createLinodes } from 'src/mocks/handlers/linode-handlers';
import { getVolumes } from 'src/mocks/handlers/volume-handlers';

export const baselineCrudPreset: MockPreset = {
  label: 'Basic CRUD',
  id: 'baseline-crud',
  group: 'General',
  handlers: [getLinodes, createLinodes, getVolumes],
};
