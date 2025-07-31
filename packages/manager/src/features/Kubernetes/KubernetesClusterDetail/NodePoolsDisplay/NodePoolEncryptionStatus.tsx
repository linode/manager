import { Stack, Typography } from '@linode/ui';
import React from 'react';

import Lock from 'src/assets/icons/lock.svg';
import Unlock from 'src/assets/icons/unlock.svg';

import type { EncryptionStatus } from '@linode/api-v4';

interface Props {
  encryptionStatus: EncryptionStatus;
}

export const NodePoolEncryptionStatus = (props: Props) => {
  const isEncrypted = props.encryptionStatus === 'enabled';

  return (
    <Stack alignItems="center" direction="row" spacing={1}>
      {isEncrypted ? <Lock /> : <Unlock />}
      <Typography sx={{ whiteSpace: 'nowrap' }}>
        {isEncrypted ? 'Encrypted' : 'Not Encrypted'}
      </Typography>
    </Stack>
  );
};
