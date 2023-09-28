import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';

import type { ResizeLinodePayload } from '@linode/api-v4/lib/linodes/types';
import type { FormikProps } from 'formik';

interface Props {
  formik: FormikProps<ResizeLinodePayload>;
  isConfirmationDialogOpen: boolean;
  isLoading: boolean;
  setIsConfirmationDialogOpen: (v: boolean) => void;
}

export const UnifiedConfirmationDialog = (props: Props) => {
  const {
    formik,
    isConfirmationDialogOpen,
    isLoading,
    setIsConfirmationDialogOpen,
  } = props;

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'confirm-resize',
            label: 'Continue',
            loading: isLoading,
            onClick: () => {
              formik.handleSubmit();
            },
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: () => setIsConfirmationDialogOpen(false),
          }}
        />
      }
      onClose={() => setIsConfirmationDialogOpen(false)}
      open={isConfirmationDialogOpen}
      title="Confirm warm resize?"
    >
      <Typography variant="subtitle1">
        During the warm resize process, your Linode will be rebooted to complete
        the migration.
      </Typography>
    </ConfirmationDialog>
  );
};
