import { getPermissions } from 'src/mocks/presets/crud/handlers/permissions';

import type { MockPresetCrud } from 'src/mocks/types';

export const permissionsCrudPreset: MockPresetCrud = {
  group: { id: 'Permissions' },
  handlers: [getPermissions],
  id: 'permissions:crud',
  label: 'Permissions CRUD',
};
