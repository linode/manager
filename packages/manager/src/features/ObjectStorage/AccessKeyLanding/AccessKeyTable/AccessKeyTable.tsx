import React, { useState } from 'react';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useFlags } from 'src/hooks/useFlags';
import { isFeatureEnabledV2 } from 'src/utilities/accountCapabilities';

import { HostNamesDrawer } from '../HostNamesDrawer';
import { AccessKeyTableBody } from './AccessKeyTableBody';

import type { OpenAccessDrawer } from '../types';
import type {
  APIError,
  ObjectStorageKey,
  ObjectStorageKeyRegions,
} from '@linode/api-v4';
import { Hidden } from 'src/components/Hidden';

export interface AccessKeyTableProps {
  data: ObjectStorageKey[] | undefined;
  error: APIError[] | null | undefined;
  isLoading: boolean;
  isRestrictedUser: boolean;
  openDrawer: OpenAccessDrawer;
  openRevokeDialog: (objectStorageKey: ObjectStorageKey) => void;
}

export const AccessKeyTable = (props: AccessKeyTableProps) => {
  const {
    data,
    error,
    isLoading,
    isRestrictedUser,
    openDrawer,
    openRevokeDialog,
  } = props;

  const [showHostNamesDrawer, setShowHostNamesDrawers] = useState<boolean>(
    false
  );
  const [hostNames, setHostNames] = useState<ObjectStorageKeyRegions[]>([]);

  const flags = useFlags();
  const { account } = useAccountManagement();

  const isObjMultiClusterEnabled = isFeatureEnabledV2(
    'Object Storage Access Key Regions',
    Boolean(flags.objMultiCluster),
    account?.capabilities ?? []
  );

  return (
    <>
      <Table
        aria-label="List of Object Storage Access Keys"
        data-testid="data-qa-access-key-table"
        rowCount={data?.length}
      >
        <TableHead>
          <TableRow>
            <TableCell>Label</TableCell>
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
            openDrawer={openDrawer}
            openRevokeDialog={openRevokeDialog}
            setHostNames={setHostNames}
            setShowHostNamesDrawers={setShowHostNamesDrawers}
          />
        </TableBody>
      </Table>
      {isObjMultiClusterEnabled && (
        <HostNamesDrawer
          onClose={() => setShowHostNamesDrawers(false)}
          open={showHostNamesDrawer}
          regions={hostNames}
        />
      )}
    </>
  );
};
