import { cancelAccount } from 'src/mocks/presets/crud/handlers/account';

import type { MockPresetCrud } from 'src/mocks/types';

export const accountCrudPreset: MockPresetCrud = {
  group: { id: 'Account' },
  handlers: [cancelAccount],
  id: 'account:crud',
  label: 'Account CRUD',
};
