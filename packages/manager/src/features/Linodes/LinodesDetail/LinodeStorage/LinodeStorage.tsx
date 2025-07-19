import { Stack } from '@linode/ui';
import * as React from 'react';

import { useLinodeDetailContext } from '../LinodesDetailContext';
import { LinodeDisks } from './LinodeDisks';
import { LinodeVolumes } from './LinodeVolumes';

export const LinodeStorage = () => {
  const { isBareMetalInstance } = useLinodeDetailContext();

  if (isBareMetalInstance) {
    return null;
  }

  return (
    <Stack spacing={2}>
      <LinodeDisks />
      <LinodeVolumes />
    </Stack>
  );
};

export default LinodeStorage;
