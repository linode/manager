import {
  ObjectStorageKey,
  RegionS3EndpointAndID,
} from '@linode/api-v4/lib/object-storage';

import { styled } from '@mui/material/styles';
import React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';

import { TableCell } from 'src/components/TableCell';

import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useFlags } from 'src/hooks/useFlags';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';
import { AccessKeyActionMenu } from './AccessKeyActionMenu';
import { OpenAccessDrawer } from '../types';

import { HostNameTableCell } from './HostNameTableCell';

// Define the props type for AccessKeyTableRow
type Props = {
  storageKeyData: ObjectStorageKey;
  openDrawer: OpenAccessDrawer;
  openRevokeDialog: (storageKeyData: ObjectStorageKey) => void;
  setHostNames: (hostNames: RegionS3EndpointAndID[]) => void;
  setShowHostNamesDrawers: (show: boolean) => void;
};

export const AccessKeyTableRow = ({
  storageKeyData,
  openDrawer,
  openRevokeDialog,
  setHostNames,
  setShowHostNamesDrawers,
}: Props) => {
  const { account } = useAccountManagement();
  const flags = useFlags();

  const isObjMultiClusterEnabled = isFeatureEnabled(
    'Object Storage Access Key Regions',
    Boolean(flags.objMultiCluster),
    account?.capabilities ?? []
  );

  return (
    <TableRow data-qa-table-row={storageKeyData.label} key={storageKeyData.id}>
      <TableCell parentColumn="Label">
        <Typography component="h3" data-qa-key-label variant="body1">
          {storageKeyData.label}
        </Typography>
      </TableCell>
      <TableCell parentColumn="Access Key">
        <Typography data-qa-key-created variant="body1">
          {storageKeyData.access_key}
          <StyledCopyIcon text={storageKeyData.access_key} />
        </Typography>
      </TableCell>
      {isObjMultiClusterEnabled && (
        <HostNameTableCell
          storageKeyData={storageKeyData}
          setHostNames={setHostNames}
          setShowHostNamesDrawers={setShowHostNamesDrawers}
        />
      )}

      <TableCell>
        <AccessKeyActionMenu
          label={storageKeyData.label}
          objectStorageKey={storageKeyData}
          openDrawer={openDrawer}
          openRevokeDialog={openRevokeDialog}
        />
      </TableCell>
    </TableRow>
  );
};

const StyledCopyIcon = styled(CopyTooltip)(({ theme }) => ({
  '& svg': {
    height: 12,
    top: 1,
    width: 12,
  },
  marginLeft: theme.spacing(),
}));
