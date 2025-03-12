import * as React from 'react';

import { Drawer } from 'src/components/Drawer';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { AccessCell } from 'src/features/ObjectStorage/AccessKeyLanding/AccessCell';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useProfile } from '@linode/queries';

import {
  StyledAccessCell,
  StyledPermissionsCell,
  StyledPermsTable,
} from './APITokenDrawer.styles';
import { basePermNameMap, scopeStringToPermTuples } from './utils';

import type { Token } from '@linode/api-v4/lib/profile/types';

interface Props {
  onClose: () => void;
  open: boolean;
  token: Token | undefined;
}

export const ViewAPITokenDrawer = (props: Props) => {
  const { onClose, open, token } = props;

  const { data: profile } = useProfile();

  const isChildAccountAccessRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'child_account_access',
  });

  const allPermissions = scopeStringToPermTuples(token?.scopes ?? '');

  // Visually hide the "Child Account Access" permission even though it's still part of the base perms.
  const hideChildAccountAccessScope =
    profile?.user_type !== 'parent' || isChildAccountAccessRestricted;

  return (
    <Drawer onClose={onClose} open={open} title={token?.label ?? 'Token'}>
      <StyledPermsTable
        aria-label="Personal Access Token Permissions"
        spacingBottom={16}
        spacingTop={24}
      >
        <TableHead>
          <TableRow>
            <TableCell data-qa-perm-access>Access</TableCell>
            <TableCell data-qa-perm-no-access style={{ textAlign: 'center' }}>
              No Access
            </TableCell>
            <TableCell data-qa-perm-read noWrap style={{ textAlign: 'center' }}>
              Read Only
            </TableCell>
            <TableCell data-qa-perm-rw style={{ textAlign: 'left' }}>
              Read/Write
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allPermissions.map((scopeTup) => {
            if (
              !basePermNameMap[scopeTup[0]] ||
              (hideChildAccountAccessScope &&
                basePermNameMap[scopeTup[0]] === 'Child Account Access')
            ) {
              return null;
            }
            return (
              <TableRow
                data-qa-row={basePermNameMap[scopeTup[0]]}
                key={scopeTup[0]}
              >
                <StyledAccessCell padding="checkbox">
                  {basePermNameMap[scopeTup[0]]}
                </StyledAccessCell>
                <StyledPermissionsCell padding="checkbox">
                  <AccessCell
                    active={scopeTup[1] === 0}
                    disabled={false}
                    onChange={() => null}
                    scope="0"
                    scopeDisplay={scopeTup[0]}
                    viewOnly={true}
                  />
                </StyledPermissionsCell>
                <StyledPermissionsCell padding="checkbox">
                  <AccessCell
                    active={scopeTup[1] === 1}
                    disabled={false}
                    onChange={() => null}
                    scope="1"
                    scopeDisplay={scopeTup[0]}
                    viewOnly={true}
                  />
                </StyledPermissionsCell>
                <TableCell padding="checkbox">
                  <AccessCell
                    active={scopeTup[1] === 2}
                    disabled={false}
                    onChange={() => null}
                    scope="2"
                    scopeDisplay={scopeTup[0]}
                    viewOnly={true}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </StyledPermsTable>
    </Drawer>
  );
};
