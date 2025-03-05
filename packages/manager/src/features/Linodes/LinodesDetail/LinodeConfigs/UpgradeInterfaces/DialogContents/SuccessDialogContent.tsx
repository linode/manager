import { Box, Button, Notice, Select, Stack } from '@linode/ui';
import React from 'react';

import { SUCCESS_DRY_RUN_COPY, SUCCESS_UPGRADE_COPY } from '../constants';

import type {
  SuccessDialogState,
  UpgradeInterfacesDialogContentProps,
} from '../types';

export const SuccessDialogContent = (
  props: UpgradeInterfacesDialogContentProps<SuccessDialogState>
) => {
  const { onClose, state } = props;

  return (
    <Stack gap={2}>
      <Notice variant="success">
        {state.isDryRun ? SUCCESS_DRY_RUN_COPY : SUCCESS_UPGRADE_COPY}
      </Notice>
      <Box gap={2}>
        <Button buttonType="secondary" onClick={onClose}>
          {state.isDryRun ? 'Cancel' : 'Close'}
        </Button>
        {state.isDryRun && (
          <Button onClick={() => {}}>Upgrade Interfaces</Button>
        )}
      </Box>
    </Stack>
  );
};
