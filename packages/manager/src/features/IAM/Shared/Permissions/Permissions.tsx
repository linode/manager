import { Spacing, Typography } from '@akamai/cds-tokens';
import { sortByString } from '@akamai/compute-ui-core/formatting';
import * as React from 'react';

import styles from '../../Shared/global.module.css';
import { Box } from '../Box/Box';
import { TruncatedList } from '../TruncatedList/TruncatedList';

import type { PermissionType } from '@linode/api-v4/lib/iam/types';

type Props = {
  permissions: PermissionType[];
};

export const Permissions = React.memo(({ permissions }: Props) => {
  const sortedPermissions = permissions.sort((a, b) => {
    return sortByString(a, b, 'asc');
  });

  return (
    <Box className={styles.noMargin} data-testid="parent" direction="column">
      <p
        style={{
          font: Typography.Label.Bold.S,
          marginBottom: Spacing.S8,
        }}
      >
        Permissions
      </p>
      {!permissions.length ? (
        <p>
          This role doesn’t include permissions. Refer to the role description
          to understand what access is granted by this role.
        </p>
      ) : (
        <TruncatedList
          dataTestId="container"
          listContainerStyle={{ marginLeft: `-${Spacing.S6}` }}
        >
          {sortedPermissions.map((permission: PermissionType) => (
            <span
              data-testid="permission"
              key={permission}
              style={{
                display: 'inline-block',
                padding: `0px ${Spacing.S6} ${Spacing.S4}`,
              }}
            >
              {permission}
            </span>
          ))}
        </TruncatedList>
      )}
    </Box>
  );
});
