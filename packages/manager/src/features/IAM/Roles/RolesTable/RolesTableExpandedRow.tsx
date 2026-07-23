import { Spacing } from '@akamai/cds-tokens';
import * as React from 'react';

import { Permissions } from '../../Shared/Permissions/Permissions';

import type { PermissionType } from '@linode/api-v4';

interface Props {
  permissions: PermissionType[];
}

export const RolesTableExpandedRow = ({ permissions }: Props) => {
  return (
    <div
      style={{
        padding: Spacing.S8,
        paddingBottom: Spacing.S12,
        paddingTop: Spacing.S12,
      }}
    >
      <Permissions permissions={permissions} />
    </div>
  );
};
