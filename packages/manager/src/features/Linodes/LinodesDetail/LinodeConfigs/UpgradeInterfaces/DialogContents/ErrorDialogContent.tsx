import { Button, List, ListItem, Notice, Stack, Typography } from '@linode/ui';
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
  const { errors, isDryRun } = state;

  return (
    <Stack gap={2}>
      <Notice important variant="error">
        <Typography>
          {isDryRun
            ? ERROR_DRY_RUN_COPY
            : errors.length > 0
            ? errors[0].reason
            : 'An unexpected error occurred.'}
        </Typography>
      </Notice>
      {isDryRun && errors.length > 0 && (
        <List dense sx={{ listStyleType: 'disc', pl: 3 }}>
          {errors.map((error) => (
            <ListItem
              disablePadding
              key={error.reason}
              sx={{ display: 'list-item' }}
            >
              {error.reason}
            </ListItem>
          ))}
        </List>
      )}
      <Stack direction="row-reverse" sx={{ paddingTop: 12 }}>
        <Button buttonType="secondary" onClick={onClose}>
          Close
        </Button>
      </Stack>
    </Stack>
  );
};
