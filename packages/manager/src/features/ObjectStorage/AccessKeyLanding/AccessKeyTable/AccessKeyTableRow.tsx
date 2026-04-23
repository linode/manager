import { useAccount } from '@linode/queries';
import { Stack, Typography } from '@linode/ui';
import { Hidden } from '@linode/ui';
import { isFeatureEnabledV2 } from '@linode/utilities';
import { styled } from '@mui/material/styles';
import React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { MaskableText } from 'src/components/MaskableText/MaskableText';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useFlags } from 'src/hooks/useFlags';

import { AccessKeyActionMenu } from './AccessKeyActionMenu';
import { HostNameTableCell } from './HostNameTableCell';

import type { ObjectStorageKey } from '@linode/api-v4';

interface Props {
  openRevokeDialog: (storageKeyData: ObjectStorageKey) => void;
  storageKeyData: ObjectStorageKey;
}

export const AccessKeyTableRow = (props: Props) => {
  const { openRevokeDialog, storageKeyData } = props;

  const { data: account } = useAccount();
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
          <HostNameTableCell storageKeyData={storageKeyData} />
        </Hidden>
      )}
      <TableCell actionCell>
        <AccessKeyActionMenu
          label={storageKeyData.label}
          objectStorageKey={storageKeyData}
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
