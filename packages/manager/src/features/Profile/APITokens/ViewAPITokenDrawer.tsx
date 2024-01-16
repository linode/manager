import { Token } from '@linode/api-v4/lib/profile/types';
import * as React from 'react';

import { Drawer } from 'src/components/Drawer';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { AccessCell } from 'src/features/ObjectStorage/AccessKeyLanding/AccessCell';
import { useFlags } from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account';
import { useAccountUser } from 'src/queries/accountUsers';
import { useProfile } from 'src/queries/profile';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';

import {
  StyledAccessCell,
  StyledPermissionsCell,
  StyledPermsTable,
} from './APITokenDrawer.styles';
import {
  basePermNameMap as _basePermNameMap,
  getPermsNameMap,
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
  const { data: account } = useAccount();
  const { data: user } = useAccountUser(profile?.username ?? '');

  const showVPCs = isFeatureEnabled(
    'VPCs',
    Boolean(flags.vpc),
    account?.capabilities ?? []
  );

  // @TODO VPC: once VPC enters GA, remove _basePermNameMap logic and references.
  // Just use the basePermNameMap import directly w/o any manipulation.
  const basePermNameMap = getPermsNameMap(_basePermNameMap, {
    name: 'vpc',
    shouldBeIncluded: showVPCs,
  });

  const allPermissions = scopeStringToPermTuples(token?.scopes ?? '');

  // Filter permissions for all users except parent user accounts.
  const showFilteredPermissions =
    (flags.parentChildAccountAccess && user?.user_type !== 'parent') ||
    Boolean(!flags.parentChildAccountAccess);
  const filteredPermissions = allPermissions.filter(
    (scopeTup) => basePermNameMap[scopeTup[0]] !== 'Child Account Access'
  );
  // TODO: Parent/Child - remove this conditional once code is in prod.
  // Note: We couldn't include 'child_account' in our list of permissions in utils
  // because it needs to be feature-flagged. Therefore, we're manually adding it here.
  if (flags.parentChildAccountAccess && user?.user_type !== null) {
    const childAccountIndex = allPermissions.findIndex(
      ([scope]) => scope === 'child_account'
    );
    if (childAccountIndex === -1) {
      allPermissions.push(['child_account', 0]);
    }
    basePermNameMap.child_account = 'Child Account Access';
  }

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
