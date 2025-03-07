import { Box, Button, Notice, Select, Stack } from '@linode/ui';
import React from 'react';

import { ERROR_DRY_RUN_COPY } from '../constants';

import type {
  ErrorDialogState,
  UpgradeInterfacesDialogContentProps,
} from '../types';

export const ErrorDialogContent = (
  props: UpgradeInterfacesDialogContentProps<ErrorDialogState>
) => {
  const { onClose, state } = props;

  return (
    <Stack gap={2}>
      {state.isDryRun ? (
        <Notice variant="error">{ERROR_DRY_RUN_COPY}</Notice>
      ) : null}
      <Button buttonType="secondary" onClick={onClose}>
        Close
      </Button>
    </Stack>
  );
};
