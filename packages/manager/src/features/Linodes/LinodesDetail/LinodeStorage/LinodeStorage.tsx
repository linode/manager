import { Stack } from '@linode/ui';
import * as React from 'react';

import { LinodeDisks } from './LinodeDisks';
import { LinodeVolumes } from './LinodeVolumes';

export const LinodeStorage = () => {
  return (
    <Stack spacing={2}>
      <LinodeDisks />
      <LinodeVolumes />
    </Stack>
  );
};

export default LinodeStorage;
