import { Radio } from '@linode/ui';
import * as React from 'react';

import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { useObjectStorageRegions } from 'src/features/ObjectStorage/hooks/useObjectStorageRegions';

import { AccessCell } from './AccessCell';
import { getUpdatedScopes } from './AccessTable';
import {
  StyledBucketCell,
  StyledClusterCell,
  StyledRadioCell,
  StyledRadioRow,
  StyledSelectAllRadioRow,
  StyledTableRoot,
} from './AccessTable.styles';

import type { MODE } from './types';
import type {
  ObjectStorageKeyBucketAccess,
  ObjectStorageKeyBucketAccessPermissions,
} from '@linode/api-v4/lib/object-storage/types';

export const SCOPES: Record<string, ObjectStorageKeyBucketAccessPermissions> = {
  none: 'none',
  read: 'read_only',
  write: 'read_write',
};

interface Props {
  bucket_access: null | ObjectStorageKeyBucketAccess[];
  checked: boolean;
  mode: MODE;
  selectedRegions?: string[];
  updateScopes: (newScopes: ObjectStorageKeyBucketAccess[]) => void;
}

export const BucketPermissionsTable = React.memo((props: Props) => {
  const { bucket_access, checked, mode, selectedRegions, updateScopes } = props;
  const { regionsByIdMap } = useObjectStorageRegions();

  if (!bucket_access || !regionsByIdMap) {
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
    return (
      bucket_access.length > 0 &&
      bucket_access.every((thisScope) => thisScope.permissions === accessType)
    );
  };

  const disabled = !checked;

  return (
    <StyledTableRoot
      aria-label="Object Storage Access Key Permissions"
      spacingTop={16}
    >
      <TableHead>
        <TableRow>
          <TableCell data-qa-perm-region>Region</TableCell>
          <TableCell data-qa-perm-bucket>Bucket</TableCell>
          <TableCell data-qa-perm-none sx={{ minWidth: '100px' }}>
            No Access
          </TableCell>
          <TableCell data-qa-perm-read sx={{ minWidth: '100px' }}>
            Read Only
          </TableCell>
          <TableCell data-qa-perm-rw sx={{ minWidth: '100px' }}>
            Read/Write
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {mode === 'creating' && (
          <StyledSelectAllRadioRow data-qa-row="Select All" disabled={disabled}>
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
                checked={allScopesEqual(SCOPES.read)}
                data-qa-perm-read-radio
                data-testid="set-all-read"
                disabled={disabled}
                inputProps={{
                  'aria-label': 'Select read-only for all',
                }}
                name="Select All"
                onChange={() => updateAllScopes(SCOPES.read)}
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
          </StyledSelectAllRadioRow>
        )}
        {bucket_access.length === 0 ? (
          <TableRowEmpty
            colSpan={9}
            message={
              !selectedRegions?.length
                ? 'Select at least one Region to see buckets'
                : 'There are no buckets in the selected regions'
            }
          />
        ) : (
          bucket_access.map((thisScope) => {
            const scopeName = `${thisScope.region}-${thisScope.bucket_name}`;
            return (
              <StyledRadioRow
                data-testid={scopeName}
                disabled={disabled}
                key={scopeName}
                mode={mode}
              >
                <StyledClusterCell
                  padding="checkbox"
                  sx={{ minWidth: '150px' }}
                >
                  {regionsByIdMap[thisScope.region ?? '']?.label}
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
          })
        )}
      </TableBody>
    </StyledTableRoot>
  );
});
