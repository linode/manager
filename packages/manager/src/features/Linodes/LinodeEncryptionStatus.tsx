import { useLinodeQuery, useRegionQuery } from '@linode/queries';
import { Stack, TooltipIcon, Typography } from '@linode/ui';
import React from 'react';

import Lock from 'src/assets/icons/lock.svg';
import Unlock from 'src/assets/icons/unlock.svg';
import { UNENCRYPTED_STANDARD_LINODE_GUIDANCE_COPY } from 'src/components/Encryption/constants';

interface Props {
  linodeId: number;
}

/**
 * Displays the Disk Encryption status for a Linode
 */
export const LinodeEncryptionStatus = ({ linodeId }: Props) => {
  const { data: linode } = useLinodeQuery(linodeId);
  const { data: region } = useRegionQuery(linode?.region ?? '');

  const isEncrypted = linode?.disk_encryption === 'enabled';

  const regionSupportsDiskEncryption =
    (region?.capabilities.includes('Disk Encryption') ||
      region?.capabilities.includes('LA Disk Encryption')) ??
    false;

  /**
   * Show guideance on how to enable/disable encryption if the
   * Linode is *not* associated with an LKE cluster *and* the Linode
   * is in a region that supports disk encryption.
   */
  const userCanControlEncryption =
    !linode?.lke_cluster_id && regionSupportsDiskEncryption;

  return (
    <Stack
      alignItems="center"
      data-testid="linode-encryption-status"
      direction="row"
      spacing={1}
    >
      {isEncrypted ? <Lock /> : <Unlock />}
      <Typography sx={{ whiteSpace: 'nowrap' }}>
        {isEncrypted ? 'Encrypted' : 'Not Encrypted'}
      </Typography>
      {userCanControlEncryption && !isEncrypted && (
        <TooltipIcon
          status="info"
          sxTooltipIcon={{ p: 0.5 }}
          text={UNENCRYPTED_STANDARD_LINODE_GUIDANCE_COPY}
        />
      )}
    </Stack>
  );
};
