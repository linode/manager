import * as React from 'react';
import { AccessCell } from './AccessCell';
import { AccessType, Scope } from '@linode/api-v4/lib/object-storage/types';
import { Radio } from 'src/components/Radio/Radio';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { update } from 'ramda';
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
  // Cluster and bucket together form a primary key
  const scopeToUpdate = oldScopes.findIndex(
    (thisScope) =>
      thisScope.bucket_name === newScope.bucket_name &&
      thisScope.cluster === newScope.cluster
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
  checked: boolean;
  mode: MODE;
  bucket_access: Scope[] | null;
  updateScopes: (newScopes: Scope[]) => void;
}

export const AccessTable = React.memo((props: TableProps) => {
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
          <TableCell data-qa-perm-cluster>Cluster</TableCell>
          <TableCell data-qa-perm-bucket>Bucket</TableCell>
          <TableCell data-qa-perm-none>None</TableCell>
          <TableCell data-qa-perm-read>Read Only</TableCell>
          <TableCell data-qa-perm-rw>Read/Write</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {mode === 'creating' && (
          <StyledRadioRow data-qa-row="Select All" disabled={disabled}>
            <TableCell parentColumn="Cluster" padding="checkbox" colSpan={2}>
              <strong>Select All</strong>
            </TableCell>
            <TableCell parentColumn="None" padding="checkbox">
              <Radio
                name="Select All"
                disabled={disabled}
                checked={allScopesEqual(SCOPES.none)}
                data-testid="set-all-none"
                value="none"
                onChange={() => updateAllScopes(SCOPES.none)}
                data-qa-perm-none-radio
                inputProps={{
                  'aria-label': 'Select none for all',
                }}
              />
            </TableCell>
            <TableCell parentColumn="Read Only" padding="checkbox">
              <Radio
                name="Select All"
                disabled={disabled}
                checked={allScopesEqual('read_only')}
                value="read-only"
                data-testid="set-all-read"
                onChange={() => updateAllScopes('read_only')}
                data-qa-perm-read-radio
                inputProps={{
                  'aria-label': 'Select read-only for all',
                }}
              />
            </TableCell>
            <TableCell parentColumn="Read/Write" padding="checkbox">
              <Radio
                name="Select All"
                disabled={disabled}
                checked={allScopesEqual(SCOPES.write)}
                data-testid="set-all-write"
                value="read-write"
                onChange={() => updateAllScopes(SCOPES.write)}
                data-qa-perm-rw-radio
                inputProps={{
                  'aria-label': 'Select read/write for all',
                }}
              />
            </TableCell>
          </StyledRadioRow>
        )}
        {bucket_access.map((thisScope) => {
          const scopeName = `${thisScope.cluster}-${thisScope.bucket_name}`;
          return (
            <StyledRadioRow
              key={scopeName}
              data-testid={scopeName}
              disabled={disabled}
              mode={mode}
            >
              <StyledClusterCell padding="checkbox">
                {thisScope.cluster}
              </StyledClusterCell>
              <StyledBucketCell padding="checkbox">
                {thisScope.bucket_name}
              </StyledBucketCell>
              <StyledRadioCell padding="checkbox">
                <AccessCell
                  active={thisScope.permissions === SCOPES.none}
                  scope="none"
                  scopeDisplay={scopeName}
                  viewOnly={mode === 'viewing'}
                  disabled={disabled}
                  onChange={() =>
                    updateSingleScope({
                      ...thisScope,
                      permissions: SCOPES.none,
                    })
                  }
                />
              </StyledRadioCell>
              <StyledRadioCell padding="checkbox">
                <AccessCell
                  active={thisScope.permissions === SCOPES.read}
                  scope="read-only"
                  scopeDisplay={scopeName}
                  viewOnly={mode === 'viewing'}
                  disabled={disabled}
                  onChange={() =>
                    updateSingleScope({
                      ...thisScope,
                      permissions: SCOPES.read,
                    })
                  }
                />
              </StyledRadioCell>
              <StyledRadioCell padding="checkbox">
                <AccessCell
                  active={thisScope.permissions === SCOPES.write}
                  scope="read-write"
                  scopeDisplay={scopeName}
                  viewOnly={mode === 'viewing'}
                  disabled={disabled}
                  onChange={() =>
                    updateSingleScope({
                      ...thisScope,
                      permissions: SCOPES.write,
                    })
                  }
                />
              </StyledRadioCell>
            </StyledRadioRow>
          );
        })}
      </TableBody>
    </StyledTableRoot>
  );
});
