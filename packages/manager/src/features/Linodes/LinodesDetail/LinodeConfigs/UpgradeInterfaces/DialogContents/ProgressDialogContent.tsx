import { Stack } from '@linode/ui';
import React from 'react';

import { LinearProgress } from 'src/components/LinearProgress';

import type {
  ProgressDialogState,
  UpgradeInterfacesDialogContentProps,
} from '../types';

export const ProgressDialogContent = (
  props: UpgradeInterfacesDialogContentProps<ProgressDialogState>
) => {
  const { state } = props;

  return (
    <Stack gap={2}>
      <LinearProgress value={state.progress} variant="determinate" />
    </Stack>
  );
};
