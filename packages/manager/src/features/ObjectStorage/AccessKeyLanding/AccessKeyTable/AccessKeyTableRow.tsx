import {
  ObjectStorageKey,
  ObjectStorageKeyRegions,
} from '@linode/api-v4/lib/object-storage';
import { styled } from '@mui/material/styles';
import React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useFlags } from 'src/hooks/useFlags';
import { isFeatureEnabledV2 } from 'src/utilities/accountCapabilities';

import { OpenAccessDrawer } from '../types';
import { AccessKeyActionMenu } from './AccessKeyActionMenu';
import { HostNameTableCell } from './HostNameTableCell';

type Props = {
  openDrawer: OpenAccessDrawer;
  openRevokeDialog: (storageKeyData: ObjectStorageKey) => void;
  setHostNames: (hostNames: ObjectStorageKeyRegions[]) => void;
  setShowHostNamesDrawers: (show: boolean) => void;
  storageKeyData: ObjectStorageKey;
};

export const AccessKeyTableRow = ({
  openDrawer,
  openRevokeDialog,
  setHostNames,
  setShowHostNamesDrawers,
  storageKeyData,
}: Props) => {
  const { account } = useAccountManagement();
  const flags = useFlags();

  const isObjMultiClusterEnabled = isFeatureEnabledV2(
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
          setHostNames={setHostNames}
          setShowHostNamesDrawers={setShowHostNamesDrawers}
          storageKeyData={storageKeyData}
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
