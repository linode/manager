import _Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { DialogTitle } from 'src/components/DialogTitle/DialogTitle';
import { Notice } from 'src/components/Notice/Notice';
import { omittedProps } from 'src/utilities/omittedProps';
import { convertForAria } from 'src/utilities/stringUtils';

import type { DialogProps as _DialogProps } from '@mui/material/Dialog';

export interface DialogProps extends _DialogProps {
  className?: string;
  error?: string;
  fullHeight?: boolean;
  subtitle?: string;
  title: string;
  titleBottomBorder?: boolean;
}

/**
 * ## Overview
 * A modal dialog is a window that appears on top of a parent screen. It's called 'modal' because it creates a mode that disables the parent screen but keeps it visible. Users must interact with the modal to return to the main screen.
 *
 * > ⚠️ In Cloud Manager, dialogs will lock focus onto the dialog and prevent scrolling. For the sake of previewing dialogs, this does not occur in Storybook.
 *
 * ## Modal Types
 * - **Standard**
 *   - Has an "X" button in the top right
 *  - Can contain anything in the body of the dialog
 * - **Confirmation**
 *  - Users must confirm a choice
 * - **Deletion**
 *  - The user must confirm the deleteion of an entity
 *  - Can require user to type the entity name to confirm deletion
 *
 * > Clicking off of the modal will not close it.
 * > A modal can only be closed by taking direct action, clicking on a button or the “X” button, or using the `esc` key.
 *
 */
export const Dialog = React.forwardRef(
  (props: DialogProps, ref: React.Ref<HTMLDivElement>) => {
    const theme = useTheme();
    const {
      children,
      className,
      error,
      fullHeight,
      fullWidth,
      maxWidth = 'md',
      onClose,
      subtitle,
      title,
      titleBottomBorder,
      ...rest
    } = props;

    const titleID = convertForAria(title);

    return (
      <StyledDialog
        aria-labelledby={titleID}
        data-qa-dialog
        data-qa-drawer
        data-testid="drawer"
        fullHeight={fullHeight}
        fullWidth={fullWidth}
        maxWidth={(fullWidth && maxWidth) ?? undefined}
        onClose={onClose}
        ref={ref}
        role="dialog"
        title={title}
        {...rest}
      >
        <Box
          sx={{
            alignItems: 'center',
          }}
        >
          <DialogTitle
            id={titleID}
            onClose={() => onClose && onClose({}, 'backdropClick')}
            subtitle={subtitle}
            title={title}
          />
          {titleBottomBorder && <StyledHr />}
          <DialogContent
            sx={{
              overflowX: 'hidden',
              paddingBottom: theme.spacing(3),
            }}
            className={className}
          >
            {error && <Notice text={error} variant="error" />}
            {children}
          </DialogContent>
        </Box>
      </StyledDialog>
    );
  }
);

const StyledDialog = styled(_Dialog, {
  shouldForwardProp: omittedProps(['fullHeight', 'title']),
})<DialogProps>(({ theme, ...props }) => ({
  '& .MuiDialog-paper': {
    height: props.fullHeight ? '100vh' : undefined,
    maxHeight: '100%',
    padding: 0,
  },
  '& .MuiDialogActions-root': {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2),
  },
}));

const StyledHr = styled('hr')({
  backgroundColor: '#e3e5e8',
  border: 'none',
  height: 1,
  margin: '-2em 8px 0px 8px',
  width: '100%',
});
