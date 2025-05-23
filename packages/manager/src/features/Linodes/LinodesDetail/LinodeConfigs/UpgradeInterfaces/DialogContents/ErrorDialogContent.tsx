import {
  Box,
  Button,
  List,
  ListItem,
  Notice,
  Stack,
  Typography,
} from '@linode/ui';
import React from 'react';

import { ERROR_DRY_RUN_COPY } from '../constants';
import { initialState } from '../UpgradeInterfacesDialog';

import type {
  ErrorDialogState,
  UpgradeInterfacesDialogContentProps,
} from '../types';

export const ErrorDialogContent = (
  props: UpgradeInterfacesDialogContentProps<ErrorDialogState>
) => {
  const { onClose, state, setDialogState } = props;
  const { errors, isDryRun } = state;

  return (
    <Stack gap={2}>
      <Notice variant="error">
        <Typography>
          {isDryRun ? ERROR_DRY_RUN_COPY : 'Unable to upgrade interfaces.'}
        </Typography>
      </Notice>
      {errors.length > 0 && (
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: 2,
          gap: 2,
        }}
      >
        <Button buttonType="secondary" onClick={onClose}>
          Close
        </Button>
        <Button
          buttonType="primary"
          onClick={() => setDialogState({ ...initialState })}
        >
          Return to Overview
        </Button>
      </Box>
    </Stack>
  );
};
