import { Stack, Typography } from '@linode/ui';
import React from 'react';

import Lock from 'src/assets/icons/lock.svg';
import Unlock from 'src/assets/icons/unlock.svg';

import type { EncryptionStatus } from '@linode/api-v4';

interface Props {
  encryptionStatus: EncryptionStatus;
}

/**
 * Displays the Disk Encryption status for a LKE Node Pool
 */
export const NodePoolEncryptionStatus = ({ encryptionStatus }: Props) => {
  const isEncrypted = encryptionStatus === 'enabled';

  return (
    <Stack alignItems="center" direction="row" spacing={1}>
      {isEncrypted ? <Lock /> : <Unlock />}
      <Typography sx={{ whiteSpace: 'nowrap' }}>
        {isEncrypted ? 'Encrypted' : 'Not Encrypted'}
      </Typography>
    </Stack>
  );
};
