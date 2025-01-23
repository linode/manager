import { Stack } from '@linode/ui';
import * as React from 'react';

import { Dialog } from 'src/components/Dialog/Dialog';

import type { DialogProps } from 'src/components/Dialog/Dialog';

export interface ConfirmationDialogProps extends DialogProps {
  /**
   * The actions to be displayed in the dialog.
   */
  actions?: ((props: DialogProps) => JSX.Element) | JSX.Element;
}

/**
 * A Confirmation Dialog is used for confirming a simple task.
 *
 * > If you are confirming a delete action, use a `Deletion Dialog`
 *
 * ### Language
 * - Avoid “Are you sure?” language. Assume the user knows what they want to do while helping them avoid unintended consequences.
 *
 */
export const ConfirmationDialog = (props: ConfirmationDialogProps) => {
  const { actions, children, ...dialogProps } = props;

  return (
    <Dialog {...dialogProps} PaperProps={{ role: undefined }}>
      {children}
      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={2}
        sx={{ mt: 4 }}
      >
        {actions && typeof actions === 'function'
          ? actions(dialogProps)
          : actions}
      </Stack>
    </Dialog>
  );
};
