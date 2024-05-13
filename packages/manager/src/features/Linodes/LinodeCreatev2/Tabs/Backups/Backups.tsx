import React from 'react';

import { Stack } from 'src/components/Stack';

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
