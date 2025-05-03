import _Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';

import { omittedProps } from '../../utilities';
import { getErrorText } from '../../utilities/error';
import { convertForAria } from '../../utilities/stringUtils';
import { Box } from '../Box';
import { CircleProgress } from '../CircleProgress';
import { DialogTitle } from '../DialogTitle';
import { ErrorState } from '../ErrorState';
import { NotFound } from '../NotFound/NotFound';

import type { APIError } from '../../utilities/error';
import type { DialogProps as _DialogProps } from '@mui/material/Dialog';
export interface DialogProps extends _DialogProps {
  /**
   * Additional CSS to be applied to the Dialog.
   */
  className?: string;
  /**
   * Whether the dialog should close when the backdrop is clicked.
   *
   * @default false
   */
  enableCloseOnBackdropClick?: boolean;
  /**
   * Error that will be shown in the dialog, such as an API error for data passed to the dialog (NotFound for instance).
   * Those are different from errors that are shown in the dialog's content, such as a form submission or validation error.
   */
  error?: APIError[] | null | string;
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
  /**
   * The element to show after the title, if provided
   * ex: a BetaChip
   */
  titleSuffix?: JSX.Element;
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
      enableCloseOnBackdropClick = false,
      error,
      fullHeight,
      fullWidth,
      isFetching,
      maxWidth = 'md',
      onClose,
      open,
      subtitle,
      title,
      titleSuffix,
      ...rest
    } = props;

    const titleID = convertForAria(title);

    // Store the last valid children and title in refs
    // This is to prevent flashes of content during the drawer's closing transition,
    // and its content becomes potentially undefined
    const lastChildrenRef = React.useRef(children);
    const lastErrorRef = React.useRef(error);
    const lastTitleRef = React.useRef(title);
    // Update refs when the drawer is open and content is matched
    if (open) {
      lastChildrenRef.current = children;
      lastTitleRef.current = title;
      lastErrorRef.current = error;
    }

    const errorText = getErrorText(lastErrorRef.current);

    return (
      <StyledDialog
        aria-labelledby={titleID}
        closeAfterTransition={false}
        data-qa-dialog
        data-qa-drawer
        data-testid="drawer"
        fullHeight={fullHeight}
        fullWidth={fullWidth}
        maxWidth={(fullWidth && maxWidth) ?? undefined}
        onClose={(_, reason) => {
          if (
            onClose &&
            (reason !== 'backdropClick' || enableCloseOnBackdropClick)
          ) {
            onClose({}, 'escapeKeyDown');
          }
        }}
        open={open}
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
            onClose={() => onClose?.({}, 'escapeKeyDown')}
            subtitle={subtitle}
            title={lastTitleRef.current}
            titleSuffix={titleSuffix}
          />
          <DialogContent
            className={className}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              overflowX: 'hidden',
              paddingBottom: theme.spacing(3),
            }}
          >
            {isFetching ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircleProgress size="md" />
              </Box>
            ) : errorText &&
              (errorText === 'Not Found' || errorText === 'Not found') ? (
              <NotFound />
            ) : (
              <>
                {errorText && <ErrorState errorText={errorText} />}
                {children}
              </>
            )}
          </DialogContent>
        </Box>
      </StyledDialog>
    );
  },
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
