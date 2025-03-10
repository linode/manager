import { Button, Notice, Stack } from '@linode/ui';
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
      <Notice important variant="error">
        {state.isDryRun
          ? ERROR_DRY_RUN_COPY
          : state.errors.length > 0
          ? state.errors[0].reason
          : 'An unexpected error occurred.'}
      </Notice>
      <Stack direction="row-reverse">
        <Button buttonType="secondary" onClick={onClose}>
          Close
        </Button>
      </Stack>
    </Stack>
  );
};
