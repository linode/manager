import { Radio } from '@linode/ui';
import * as React from 'react';

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
import type {
  ObjectStorageKeyBucketAccess,
  ObjectStorageKeyBucketAccessPermissions,
} from '@linode/api-v4/lib/object-storage/types';

export const getUpdatedScopes = (
  oldScopes: ObjectStorageKeyBucketAccess[],
  newScope: ObjectStorageKeyBucketAccess
): ObjectStorageKeyBucketAccess[] => {
  // Cluster and bucket together form a primary key
  const scopeToUpdateIndex = oldScopes.findIndex(
    (thisScope) =>
      thisScope.bucket_name === newScope.bucket_name &&
      thisScope.cluster === newScope.cluster
  );
  if (scopeToUpdateIndex < 0) {
    return oldScopes;
  }
  const updatedScopes = [...oldScopes];
  updatedScopes[scopeToUpdateIndex] = newScope;
  return updatedScopes;
};

export const SCOPES: Record<string, ObjectStorageKeyBucketAccessPermissions> = {
  none: 'none',
  read: 'read_only',
  write: 'read_write',
};

interface TableProps {
  bucket_access: null | ObjectStorageKeyBucketAccess[];
  checked: boolean;
  mode: MODE;
  updateScopes: (newScopes: ObjectStorageKeyBucketAccess[]) => void;
}

export const AccessTable = React.memo((props: TableProps) => {
  const { bucket_access, checked, mode, updateScopes } = props;

  if (!bucket_access) {
    return null;
  }

  const updateSingleScope = (newScope: ObjectStorageKeyBucketAccess) => {
    const newScopes = getUpdatedScopes(bucket_access, newScope);
    updateScopes(newScopes);
  };

  const updateAllScopes = (
    accessType: ObjectStorageKeyBucketAccessPermissions
  ) => {
    const newScopes = bucket_access.map((thisScope) => ({
      ...thisScope,
      permissions: accessType,
    }));
    updateScopes(newScopes);
  };

  const allScopesEqual = (
    accessType: ObjectStorageKeyBucketAccessPermissions
  ) => {
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
            <TableCell colSpan={2} padding="checkbox">
              <strong>Select All</strong>
            </TableCell>
            <TableCell padding="checkbox">
              <Radio
                checked={allScopesEqual(SCOPES.none)}
                data-qa-perm-none-radio
                data-testid="set-all-none"
                disabled={disabled}
                inputProps={{
                  'aria-label': 'Select none for all',
                }}
                name="Select All"
                onChange={() => updateAllScopes(SCOPES.none)}
                value="none"
              />
            </TableCell>
            <TableCell padding="checkbox">
              <Radio
                checked={allScopesEqual('read_only')}
                data-qa-perm-read-radio
                data-testid="set-all-read"
                disabled={disabled}
                inputProps={{
                  'aria-label': 'Select read-only for all',
                }}
                name="Select All"
                onChange={() => updateAllScopes('read_only')}
                value="read-only"
              />
            </TableCell>
            <TableCell padding="checkbox">
              <Radio
                checked={allScopesEqual(SCOPES.write)}
                data-qa-perm-rw-radio
                data-testid="set-all-write"
                disabled={disabled}
                inputProps={{
                  'aria-label': 'Select read/write for all',
                }}
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
                {thisScope.cluster}
              </StyledClusterCell>
              <StyledBucketCell padding="checkbox">
                {thisScope.bucket_name}
              </StyledBucketCell>
              <StyledRadioCell padding="checkbox">
                <AccessCell
                  active={thisScope.permissions === SCOPES.none}
                  disabled={disabled}
                  onChange={() =>
                    updateSingleScope({
                      ...thisScope,
                      permissions: SCOPES.none,
                    })
                  }
                  scope="none"
                  scopeDisplay={scopeName}
                  viewOnly={mode === 'viewing'}
                />
              </StyledRadioCell>
              <StyledRadioCell padding="checkbox">
                <AccessCell
                  active={thisScope.permissions === SCOPES.read}
                  disabled={disabled}
                  onChange={() =>
                    updateSingleScope({
                      ...thisScope,
                      permissions: SCOPES.read,
                    })
                  }
                  scope="read-only"
                  scopeDisplay={scopeName}
                  viewOnly={mode === 'viewing'}
                />
              </StyledRadioCell>
              <StyledRadioCell padding="checkbox">
                <AccessCell
                  active={thisScope.permissions === SCOPES.write}
                  disabled={disabled}
                  onChange={() =>
                    updateSingleScope({
                      ...thisScope,
                      permissions: SCOPES.write,
                    })
                  }
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
