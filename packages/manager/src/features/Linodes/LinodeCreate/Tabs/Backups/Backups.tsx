import { Stack } from '@linode/ui';
import React from 'react';

import { BackupSelect } from './BackupSelect';
import { LinodeSelect } from './LinodeSelect';

export const Backups = () => {
  return (
    <Stack spacing={3}>
      <LinodeSelect />
      <BackupSelect />
    </Stack>
  );
};
