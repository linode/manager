import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from 'src/mocks/presets/crud/handlers/users';

import type { MockPresetCrud } from 'src/mocks/types';

export const usersCrudPreset: MockPresetCrud = {
  group: { id: 'Users' },
  handlers: [getUsers, createUser, updateUser, deleteUser],
  id: 'users:crud',
  label: 'Users CRUD',
};
