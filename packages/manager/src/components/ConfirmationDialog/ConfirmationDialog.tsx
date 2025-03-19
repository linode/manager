import { Dialog, Stack } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import type { DialogProps } from '@linode/ui';

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
export const ConfirmationDialog = React.forwardRef<
  HTMLDivElement,
  ConfirmationDialogProps
>((props, ref) => {
  const { actions, children, ...dialogProps } = props;

  return (
    <Dialog {...dialogProps} PaperProps={{ role: undefined }} ref={ref}>
      <StyledDialogContentSection>{children}</StyledDialogContentSection>
      <Stack direction="row" justifyContent="flex-end" spacing={2}>
        {actions && typeof actions === 'function'
          ? actions(dialogProps)
          : actions}
      </Stack>
    </Dialog>
  );
});

const StyledDialogContentSection = styled(Stack, {
  label: 'StyledDialogContentSection',
})(({ theme: { spacing } }) => ({
  marginBottom: spacing(2),
  order: -1,
}));
