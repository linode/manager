import { CloseIcon } from '@linode/ui';
import _Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { getErrorText } from '../../utilities/error';
import { convertForAria } from '../../utilities/stringUtils';
import { Box } from '../Box';
import { CircleProgress } from '../CircleProgress';
import { ErrorState } from '../ErrorState';
import { IconButton } from '../IconButton';
import { NotFound } from '../NotFound/NotFound';
import { Typography } from '../Typography';

import type { APIError } from '../../utilities/error';
import type { DrawerProps as _DrawerProps } from '@mui/material/Drawer';

export interface DrawerProps extends _DrawerProps {
  /**
   * Error that will be shown in the drawer, such as an API error for data passed to the drawer (NotFound for instance).
   * Those are different from errors that are shown in the drawer's content, such as a form submission or validation error.
   * It prevents the drawer from showing broken content.
   */
  error?: APIError[] | null | string;
  /**
   * Whether the drawer is fetching the entity's data.
   *
   * If true, the drawer will feature a loading spinner for its content.
   */
  isFetching?: boolean;
  /**
   * Title that appears at the top of the drawer
   */
  title: string;
  /**
   * Increases the Drawers width from 480px to 700px on desktop-sized viewports
   * @default false
   */
  wide?: boolean;
}

/**
 * ## Overview
 * - Drawers are essentially modal dialogs that appear on the right of the screen rather than the center.
 * - Like traditional modals, they block interaction with the page content.
 * - They are elevated above the app’s UI and don’t affect the screen’s layout grid.
 *
 * ## Behavior
 *
 * - Clicking a button on the screen opens the drawer.
 * - Drawers can be closed by pressing the `esc` key, clicking the “X” icon, or clicking the “Cancel” button.
 */
export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  (props: DrawerProps, ref) => {
    const {
      children,
      error,
      isFetching,
      onClose,
      open,
      sx,
      title,
      wide,
      ...rest
    } = props;
    const titleID = convertForAria(title);

    const theme = useTheme();

    const sxDrawer = {
      '& .MuiDrawer-paper': {
        padding: theme.spacing(4),
        [theme.breakpoints.down('sm')]: {
          padding: theme.spacing(2),
        },
        ...(wide
          ? {
              maxWidth: 700,
              width: '100%',
            }
          : {
              [theme.breakpoints.down('sm')]: {
                maxWidth: 445,
                width: '100%',
              },
              width: 480,
            }),
      },
      '& .actionPanel': {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: theme.spacing(1),
      },
      '& .selectionCard': {
        flexBasis: '100%',
        maxWidth: '100%',
      },
    };

    // Store the last valid children and title in refs
    // This is to prevent flashes of content during the drawer's closing transition,
    // and its content becomes potentially undefined
    const lastChildrenRef = React.useRef(children);
    const lastTitleRef = React.useRef(title);
    const lastErrorRef = React.useRef(error);
    // Update refs when the drawer is open and content is matched
    if (open) {
      lastChildrenRef.current = children;
      lastTitleRef.current = title;
      lastErrorRef.current = error;
    }

    const errorText = getErrorText(lastErrorRef.current);

    return (
      <_Drawer
        anchor="right"
        onClose={(_, reason) => {
          if (onClose && reason !== 'backdropClick') {
            onClose({}, 'escapeKeyDown');
          }
        }}
        open={open}
        ref={ref}
        sx={{
          ...sxDrawer,
          ...sx,
        }}
        {...rest}
        aria-labelledby={titleID}
        data-qa-drawer
        data-testid="drawer"
        role="dialog"
      >
        <Grid
          container
          sx={(theme) => ({
            '&&': {
              marginBottom: theme.spacing(2),
            },
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            position: 'relative',
          })}
          wrap="nowrap"
        >
          <Grid>
            {isFetching ? null : (
              <Typography
                data-qa-drawer-title={lastTitleRef.current}
                data-testid="drawer-title"
                id={titleID}
                sx={(theme) => ({
                  marginRight: theme.spacing(2),
                  wordBreak: 'break-word',
                })}
                variant="h2"
              >
                {lastTitleRef.current}
              </Typography>
            )}
          </Grid>
          <Grid>
            <IconButton
              aria-label="Close drawer"
              color="primary"
              data-qa-close-drawer
              onClick={() => onClose?.({}, 'escapeKeyDown')}
              size="large"
              sx={{
                position: 'absolute',
                right: '-12px',
                top: '-12px',
              }}
            >
              <CloseIcon />
            </IconButton>
          </Grid>
        </Grid>
        {isFetching ? (
          <Box display="flex" justifyContent="center" mt={12}>
            <CircleProgress size="md" />
          </Box>
        ) : errorText &&
          (errorText === 'Not Found' || errorText === 'Not found') ? (
          <NotFound alignTop />
        ) : (
          <>
            {errorText && <ErrorState errorText={errorText} />}
            {lastChildrenRef.current}
          </>
        )}
      </_Drawer>
    );
  },
);
