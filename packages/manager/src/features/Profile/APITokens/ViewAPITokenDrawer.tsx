import { Token } from '@linode/api-v4/lib/profile/types';
import * as React from 'react';

import { Drawer } from 'src/components/Drawer';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { AccessCell } from 'src/features/ObjectStorage/AccessKeyLanding/AccessCell';
import { useFlags } from 'src/hooks/useFlags';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useProfile } from 'src/queries/profile';

import {
  StyledAccessCell,
  StyledPermissionsCell,
  StyledPermsTable,
} from './APITokenDrawer.styles';
import {
  basePermNameMap as _basePermNameMap,
  filterPermsNameMap,
  scopeStringToPermTuples,
} from './utils';

interface Props {
  onClose: () => void;
  open: boolean;
  token: Token | undefined;
}

export const ViewAPITokenDrawer = (props: Props) => {
  const { onClose, open, token } = props;

  const flags = useFlags();

  const { data: profile } = useProfile();

  const isChildAccountAccessRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'child_account_access',
  });

  const hasParentChildAccountAccess = Boolean(flags.parentChildAccountAccess);

  // @TODO: Parent/Child - once in GA, remove _basePermNameMap logic and references.
  // Just use the basePermNameMap import directly w/o any manipulation.
  const basePermNameMap = filterPermsNameMap(_basePermNameMap, [
    {
      name: 'child_account',
      shouldBeIncluded: hasParentChildAccountAccess,
    },
  ]);

  const allPermissions = scopeStringToPermTuples(token?.scopes ?? '');

  /**
   * A parent user with child_account_access can issue a PAT with child_account scope.
   * If access is later revoked, we'll still display this scope for existing PATs, but not for new ones.
   * */
  const hideChildAccountAccessScope = allPermissions.some(
    (scope) =>
      scope[0] === 'child_account' &&
      scope[1] === 0 &&
      isChildAccountAccessRestricted
  );

  // Filter permissions for all users except parent user accounts.
  const showFilteredPermissions =
    !flags.parentChildAccountAccess ||
    profile?.user_type !== 'parent' ||
    hideChildAccountAccessScope;

  const filteredPermissions = allPermissions.filter(
    (scopeTup) => basePermNameMap[scopeTup[0]] !== 'Child Account Access'
  );

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
            <TableCell data-qa-perm-none style={{ textAlign: 'center' }}>
              None
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
          {(showFilteredPermissions ? filteredPermissions : allPermissions).map(
            (scopeTup) => {
              if (!basePermNameMap[scopeTup[0]]) {
                return null;
              }
              return (
                <TableRow
                  data-qa-row={basePermNameMap[scopeTup[0]]}
                  key={scopeTup[0]}
                >
                  <StyledAccessCell padding="checkbox" parentColumn="Access">
                    {basePermNameMap[scopeTup[0]]}
                  </StyledAccessCell>
                  <StyledPermissionsCell padding="checkbox" parentColumn="None">
                    <AccessCell
                      active={scopeTup[1] === 0}
                      disabled={false}
                      onChange={() => null}
                      scope="0"
                      scopeDisplay={scopeTup[0]}
                      viewOnly={true}
                    />
                  </StyledPermissionsCell>
                  <StyledPermissionsCell
                    padding="checkbox"
                    parentColumn="Read Only"
                  >
                    <AccessCell
                      active={scopeTup[1] === 1}
                      disabled={false}
                      onChange={() => null}
                      scope="1"
                      scopeDisplay={scopeTup[0]}
                      viewOnly={true}
                    />
                  </StyledPermissionsCell>
                  <TableCell padding="checkbox" parentColumn="Read/Write">
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
            }
          )}
        </TableBody>
      </StyledPermsTable>
    </Drawer>
  );
};
