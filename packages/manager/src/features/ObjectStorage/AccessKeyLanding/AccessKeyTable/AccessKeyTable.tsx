import { styled } from '@mui/material/styles';
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
  ObjectStorageKey,
  ObjectStorageKeyRegions,
} from '@linode/api-v4/lib/object-storage';
import type { APIError } from '@linode/api-v4/lib/types';

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
        colCount={2}
        data-testid="data-qa-access-key-table"
        rowCount={data?.length}
      >
        <TableHead>
          <TableRow data-qa-table-head>
            <StyledLabelCell data-qa-header-label>Label</StyledLabelCell>
            <StyledLabelCell data-qa-header-key>Access Key</StyledLabelCell>
            {isObjMultiClusterEnabled && (
              <StyledLabelCell data-qa-header-key>
                Regions/S3 Hostnames
              </StyledLabelCell>
            )}
            {/* empty cell for kebab menu */}
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          <AccessKeyTableBody
            data={data}
            error={error}
            isLoading={isLoading}
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

const StyledLabelCell = styled(TableCell)(() => ({
  width: '35%',
}));
