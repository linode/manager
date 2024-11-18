import { Box, CircleProgress, Notice, omittedProps } from '@linode/ui';
import _Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';

import { DialogTitle } from 'src/components/DialogTitle/DialogTitle';
import { convertForAria } from 'src/utilities/stringUtils';

import type { DialogProps as _DialogProps } from '@mui/material/Dialog';

export interface DialogProps extends _DialogProps {
  /**
   * Additional CSS to be applied to the Dialog.
   */
  className?: string;
  /**
   * Error that will be shown in the dialog.
   */
  error?: string;
  /**
   * Let the Dialog take up the entire height of the viewport.
   */
  fullHeight?: boolean;
  /**
   * Whether the drawer is fetching the entity's data.
   *
   * If true, the drawer will feature a loading spinner for its content.
   */
  isFetching?: boolean;
  /**
   * Subtitle that will be shown in the dialog.
   */
  subtitle?: string;
  /**
   * Title that will be shown in the dialog.
   */
  title: string;
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
 *  - The user must confirm the deletion of an entity
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
      isFetching,
      maxWidth = 'md',
      onClose,
      open,
      subtitle,
      title,
      ...rest
    } = props;

    const [closingTransition, setClosingTransition] = React.useState(false);

    const titleID = convertForAria(title);

    const handleClose = () => {
      setClosingTransition(true);
    };

    const handleExited = () => {
      onClose?.({}, 'escapeKeyDown');
    };

    React.useEffect(() => {
      if (open) {
        setClosingTransition(false);
      }
    }, [open]);

    return (
      <StyledDialog
        onClose={(_, reason) => {
          if (onClose && reason !== 'backdropClick') {
            handleClose();
          }
        }}
        aria-labelledby={titleID}
        data-qa-dialog
        data-qa-drawer
        data-testid="drawer"
        fullHeight={fullHeight}
        fullWidth={fullWidth}
        maxWidth={(fullWidth && maxWidth) ?? undefined}
        onTransitionExited={handleExited}
        open={open && !closingTransition}
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
            isFetching={isFetching}
            onClose={handleClose}
            subtitle={subtitle}
            title={title}
          />
          <DialogContent
            sx={{
              overflowX: 'hidden',
              paddingBottom: theme.spacing(3),
            }}
            className={className}
          >
            {isFetching ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircleProgress size="md" />
              </Box>
            ) : (
              <>
                {error && <Notice text={error} variant="error" />}
                {children}
              </>
            )}
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
    minWidth: '500px',
    padding: 0,
    [theme.breakpoints.down('md')]: {
      minWidth: '380px',
    },
  },
}));
