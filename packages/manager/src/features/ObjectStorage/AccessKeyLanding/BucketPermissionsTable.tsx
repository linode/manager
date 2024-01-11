import { AccessType, Scope } from '@linode/api-v4/lib/object-storage/types';
import { update } from 'ramda';
import * as React from 'react';

import { Radio } from 'src/components/Radio/Radio';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';

import { AccessCell } from './AccessCell';
import {
  StyledBucketCell,
  StyledClusterCell,
  StyledRadioCell,
  StyledRadioRow,
  StyledTableRoot,
} from './AccessTable.styles';

import type { MODE } from './types';

export const getUpdatedScopes = (
  oldScopes: Scope[],
  newScope: Scope
): Scope[] => {
  // Region and bucket together form a primary key
  const scopeToUpdate = oldScopes.findIndex(
    (thisScope) =>
      thisScope.bucket_name === newScope.bucket_name &&
      thisScope.region === newScope.region
  );
  if (scopeToUpdate < 0) {
    return oldScopes;
  }
  return update(scopeToUpdate, newScope, oldScopes);
};

export const SCOPES: Record<string, AccessType> = {
  none: 'none',
  read: 'read_only',
  write: 'read_write',
};

interface TableProps {
  bucket_access: Scope[] | null;
  checked: boolean;
  mode: MODE;
  updateScopes: (newScopes: Scope[]) => void;
}

export const BucketPermissionsTable = React.memo((props: TableProps) => {
  const { bucket_access, checked, mode, updateScopes } = props;

  if (!bucket_access) {
    return null;
  }

  const updateSingleScope = (newScope: Scope) => {
    const newScopes = getUpdatedScopes(bucket_access, newScope);
    updateScopes(newScopes);
  };

  const updateAllScopes = (accessType: AccessType) => {
    const newScopes = bucket_access.map((thisScope) => ({
      ...thisScope,
      permissions: accessType,
    }));
    updateScopes(newScopes);
  };

  const allScopesEqual = (accessType: AccessType) => {
    return bucket_access.every(
      (thisScope) => thisScope.permissions === accessType
    );
  };

  const disabled = !checked;

  return (
    <StyledTableRoot
      aria-label="Object Storage Access Key Permissions"
      spacingTop={24}
    >
      <TableHead>
        <TableRow>
          <TableCell data-qa-perm-region>Region</TableCell>
          <TableCell data-qa-perm-bucket>Bucket</TableCell>
          <TableCell data-qa-perm-none>None</TableCell>
          <TableCell data-qa-perm-read>Read Only</TableCell>
          <TableCell data-qa-perm-rw>Read/Write</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {mode === 'creating' && (
          <StyledRadioRow data-qa-row="Select All" disabled={disabled}>
            <TableCell colSpan={2} padding="checkbox" parentColumn="Region">
              <strong>Select All</strong>
            </TableCell>
            <TableCell padding="checkbox" parentColumn="None">
              <Radio
                inputProps={{
                  'aria-label': 'Select none for all',
                }}
                checked={allScopesEqual(SCOPES.none)}
                data-qa-perm-none-radio
                data-testid="set-all-none"
                disabled={disabled}
                name="Select All"
                onChange={() => updateAllScopes(SCOPES.none)}
                value="none"
              />
            </TableCell>
            <TableCell padding="checkbox" parentColumn="Read Only">
              <Radio
                inputProps={{
                  'aria-label': 'Select read-only for all',
                }}
                checked={allScopesEqual('read_only')}
                data-qa-perm-read-radio
                data-testid="set-all-read"
                disabled={disabled}
                name="Select All"
                onChange={() => updateAllScopes('read_only')}
                value="read-only"
              />
            </TableCell>
            <TableCell padding="checkbox" parentColumn="Read/Write">
              <Radio
                inputProps={{
                  'aria-label': 'Select read/write for all',
                }}
                checked={allScopesEqual(SCOPES.write)}
                data-qa-perm-rw-radio
                data-testid="set-all-write"
                disabled={disabled}
                name="Select All"
                onChange={() => updateAllScopes(SCOPES.write)}
                value="read-write"
              />
            </TableCell>
          </StyledRadioRow>
        )}
        {bucket_access.map((thisScope) => {
          const scopeName = `${thisScope.cluster}-${thisScope.bucket_name}`;
          return (
            <StyledRadioRow
              data-testid={scopeName}
              disabled={disabled}
              key={scopeName}
              mode={mode}
            >
              <StyledClusterCell padding="checkbox">
                {thisScope.region}
              </StyledClusterCell>
              <StyledBucketCell padding="checkbox">
                {thisScope.bucket_name}
              </StyledBucketCell>
              <StyledRadioCell padding="checkbox">
                <AccessCell
                  onChange={() =>
                    updateSingleScope({
                      ...thisScope,
                      permissions: SCOPES.none,
                    })
                  }
                  active={thisScope.permissions === SCOPES.none}
                  disabled={disabled}
                  scope="none"
                  scopeDisplay={scopeName}
                  viewOnly={mode === 'viewing'}
                />
              </StyledRadioCell>
              <StyledRadioCell padding="checkbox">
                <AccessCell
                  onChange={() =>
                    updateSingleScope({
                      ...thisScope,
                      permissions: SCOPES.read,
                    })
                  }
                  active={thisScope.permissions === SCOPES.read}
                  disabled={disabled}
                  scope="read-only"
                  scopeDisplay={scopeName}
                  viewOnly={mode === 'viewing'}
                />
              </StyledRadioCell>
              <StyledRadioCell padding="checkbox">
                <AccessCell
                  onChange={() =>
                    updateSingleScope({
                      ...thisScope,
                      permissions: SCOPES.write,
                    })
                  }
                  active={thisScope.permissions === SCOPES.write}
                  disabled={disabled}
                  scope="read-write"
                  scopeDisplay={scopeName}
                  viewOnly={mode === 'viewing'}
                />
              </StyledRadioCell>
            </StyledRadioRow>
          );
        })}
      </TableBody>
    </StyledTableRoot>
  );
});
