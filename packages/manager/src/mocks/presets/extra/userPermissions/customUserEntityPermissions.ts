import { http } from 'msw';

import { userEntityPermissionsFactory } from 'src/factories/userEntityPermissions';
import { makeResponse } from 'src/mocks/utilities/response';

import type { PermissionType } from '@linode/api-v4';
import type { MockPresetExtra } from 'src/mocks/types';

let customUserEntityPermissionsData: null | PermissionType[] = null;

export const setCustomUserEntityPermissionsData = (
  data: null | PermissionType[]
) => {
  customUserEntityPermissionsData = data;
};

const mockCustomUserEntityPermissions = () => {
  return [
    http.get(
      '*/v4*/iam/users/:username/permissions/:entity_type/:entity_id',
      async () => {
        return makeResponse(
          customUserEntityPermissionsData
            ? customUserEntityPermissionsData
            : userEntityPermissionsFactory
        );
      }
    ),
  ];
};

export const customUserEntityPermissionsPreset: MockPresetExtra = {
  desc: 'Custom User Entity Permissions',
  group: { id: 'User Permissions', type: 'userPermissions' },
  handlers: [mockCustomUserEntityPermissions],
  id: 'userEntityPermissions:custom',
  label: 'Custom User Entity Permissions',
};
