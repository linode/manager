import { Hidden } from '@linode/ui';
import React from 'react';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';

import { useIsObjMultiClusterEnabled } from '../../hooks/useIsObjectStorageGen2Enabled';
import { AccessKeyTableBody } from './AccessKeyTableBody';

import type { APIError, ObjectStorageKey } from '@linode/api-v4';

export interface AccessKeyTableProps {
  data: ObjectStorageKey[] | undefined;
  error: APIError[] | null | undefined;
  isLoading: boolean;
  isRestrictedUser: boolean;
  openRevokeDialog: (objectStorageKey: ObjectStorageKey) => void;
}

export const AccessKeyTable = (props: AccessKeyTableProps) => {
  const { data, error, isLoading, isRestrictedUser, openRevokeDialog } = props;

  const { isObjMultiClusterEnabled } = useIsObjMultiClusterEnabled();

  return (
    <Table
      aria-label="List of Object Storage Access Keys"
      data-testid="data-qa-access-key-table"
      rowCount={data?.length}
    >
      <TableHead>
        <TableRow>
          <TableCell
            sx={(theme) => ({
              [theme.breakpoints.up('md')]: {
                minWidth: 120,
              },
            })}
          >
            Label
          </TableCell>
          <TableCell>Access Key</TableCell>
          {isObjMultiClusterEnabled && (
            <Hidden smDown>
              <TableCell>Regions/S3 Hostnames</TableCell>
            </Hidden>
          )}
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        <AccessKeyTableBody
          data={data}
          error={error}
          isLoading={isLoading}
          isObjMultiClusterEnabled={isObjMultiClusterEnabled}
          isRestrictedUser={isRestrictedUser}
          openRevokeDialog={openRevokeDialog}
        />
      </TableBody>
    </Table>
  );
};
