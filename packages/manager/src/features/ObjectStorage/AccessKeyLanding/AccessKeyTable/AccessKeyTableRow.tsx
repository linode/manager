import { styled } from '@mui/material/styles';
import React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { MaskableText } from 'src/components/MaskableText/MaskableText';
import { Stack } from 'src/components/Stack';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useFlags } from 'src/hooks/useFlags';
import { isFeatureEnabledV2 } from 'src/utilities/accountCapabilities';

import { AccessKeyActionMenu } from './AccessKeyActionMenu';
import { StyledLastColumnCell } from './AccessKeyTable.styles';
import { HostNameTableCell } from './HostNameTableCell';

import type { OpenAccessDrawer } from '../types';
import type {
  ObjectStorageKey,
  ObjectStorageKeyRegions,
} from '@linode/api-v4/lib/object-storage';

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
        <Stack direction="row">
          <MaskableText isToggleable text={storageKeyData.access_key}>
            <Typography data-qa-key-created variant="body1">
              {storageKeyData.access_key}
            </Typography>
          </MaskableText>
          <StyledCopyIcon text={storageKeyData.access_key} />
        </Stack>
      </TableCell>
      {isObjMultiClusterEnabled && (
        <HostNameTableCell
          setHostNames={setHostNames}
          setShowHostNamesDrawers={setShowHostNamesDrawers}
          storageKeyData={storageKeyData}
        />
      )}

      <StyledLastColumnCell addPaddingRight={isObjMultiClusterEnabled}>
        <AccessKeyActionMenu
          label={storageKeyData.label}
          objectStorageKey={storageKeyData}
          openDrawer={openDrawer}
          openRevokeDialog={openRevokeDialog}
        />
      </StyledLastColumnCell>
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
