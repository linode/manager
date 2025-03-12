import { Box, Button, Stack } from '@linode/ui';
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
      <Box sx={{ paddingBottom: 12, paddingTop: 12 }}>
        <LinearProgress value={state.progress} variant="determinate" />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button buttonType="primary" loading onClick={() => {}}>
          Upgrade
        </Button>
      </Box>
    </Stack>
  );
};
