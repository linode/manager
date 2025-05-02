import { Stack, Typography } from '@linode/ui';
import { isFeatureEnabledV2 } from '@linode/utilities';
import { styled } from '@mui/material/styles';
import React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Hidden } from 'src/components/Hidden';
import { MaskableText } from 'src/components/MaskableText/MaskableText';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useFlags } from 'src/hooks/useFlags';

import { AccessKeyActionMenu } from './AccessKeyActionMenu';
import { HostNameTableCell } from './HostNameTableCell';

import type { OpenAccessDrawer } from '../types';
import type { ObjectStorageKey, ObjectStorageKeyRegions } from '@linode/api-v4';

interface Props {
  openDrawer: OpenAccessDrawer;
  openRevokeDialog: (storageKeyData: ObjectStorageKey) => void;
  setHostNames: (hostNames: ObjectStorageKeyRegions[]) => void;
  setShowHostNamesDrawers: (show: boolean) => void;
  storageKeyData: ObjectStorageKey;
}

export const AccessKeyTableRow = (props: Props) => {
  const {
    openDrawer,
    openRevokeDialog,
    setHostNames,
    setShowHostNamesDrawers,
    storageKeyData,
  } = props;

  const { account } = useAccountManagement();
  const flags = useFlags();

  const isObjMultiClusterEnabled = isFeatureEnabledV2(
    'Object Storage Access Key Regions',
    Boolean(flags.objMultiCluster),
    account?.capabilities ?? []
  );

  return (
    <TableRow data-qa-table-row={storageKeyData.label} key={storageKeyData.id}>
      <TableCell>{storageKeyData.label}</TableCell>
      <TableCell>
        <Stack direction="row">
          <MaskableText isToggleable text={storageKeyData.access_key}>
            <Typography variant="body1">{storageKeyData.access_key}</Typography>
          </MaskableText>
          <StyledCopyIcon text={storageKeyData.access_key} />
        </Stack>
      </TableCell>
      {isObjMultiClusterEnabled && (
        <Hidden smDown>
          <HostNameTableCell
            setHostNames={setHostNames}
            setShowHostNamesDrawers={setShowHostNamesDrawers}
            storageKeyData={storageKeyData}
          />
        </Hidden>
      )}
      <TableCell actionCell>
        <AccessKeyActionMenu
          openHostnamesDrawer={() => {
            setShowHostNamesDrawers(true);
            setHostNames(storageKeyData.regions);
          }}
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
