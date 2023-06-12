import * as React from 'react';
import Drawer from 'src/components/Drawer';
import { AccessCell } from 'src/features/ObjectStorage/AccessKeyLanding/AccessCell';
import { scopeStringToPermTuples, basePermNameMap } from './utils';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { Token } from '@linode/api-v4/lib/profile/types';
import {
  StyledAccessCell,
  StyledPermissionsCell,
  StyledPermsTable,
} from './APITokenDrawer.styles';

interface Props {
  open: boolean;
  onClose: () => void;
  token: Token | undefined;
}

export const ViewAPITokenDrawer = (props: Props) => {
  const { open, onClose, token } = props;

  const permissions = scopeStringToPermTuples(token?.scopes ?? '');

  return (
    <Drawer title={token?.label ?? 'Token'} open={open} onClose={onClose}>
      <StyledPermsTable
        aria-label="Personal Access Token Permissions"
        spacingTop={24}
        spacingBottom={16}
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
          {permissions.map((scopeTup) => {
            if (!basePermNameMap[scopeTup[0]]) {
              return null;
            }
            return (
              <TableRow
                key={scopeTup[0]}
                data-qa-row={basePermNameMap[scopeTup[0]]}
              >
                <StyledAccessCell parentColumn="Access" padding="checkbox">
                  {basePermNameMap[scopeTup[0]]}
                </StyledAccessCell>
                <StyledPermissionsCell parentColumn="None" padding="checkbox">
                  <AccessCell
                    active={scopeTup[1] === 0}
                    scope="0"
                    scopeDisplay={scopeTup[0]}
                    viewOnly={true}
                    disabled={false}
                    onChange={() => null}
                  />
                </StyledPermissionsCell>
                <StyledPermissionsCell
                  parentColumn="Read Only"
                  padding="checkbox"
                >
                  <AccessCell
                    active={scopeTup[1] === 1}
                    scope="1"
                    scopeDisplay={scopeTup[0]}
                    viewOnly={true}
                    disabled={false}
                    onChange={() => null}
                  />
                </StyledPermissionsCell>
                <TableCell parentColumn="Read/Write" padding="checkbox">
                  <AccessCell
                    active={scopeTup[1] === 2}
                    scope="2"
                    scopeDisplay={scopeTup[0]}
                    viewOnly={true}
                    disabled={false}
                    onChange={() => null}
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
