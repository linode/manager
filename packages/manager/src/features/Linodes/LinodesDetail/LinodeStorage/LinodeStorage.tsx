import * as React from 'react';

import { Stack } from 'src/components/Stack';

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
