import Close from '@mui/icons-material/Close';
import _Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { convertForAria } from '../../utilities/stringUtils';
import { Box } from '../Box';
import { CircleProgress } from '../CircleProgress';
import { ErrorState } from '../ErrorState';
import { IconButton } from '../IconButton';
import { Typography } from '../Typography';

import type { DrawerProps as _DrawerProps } from '@mui/material/Drawer';

// simplified APIError interface for use in this file (api-v4 is not a dependency of ui)
interface APIError {
  field?: string;
  reason: string;
}

interface BaseProps extends _DrawerProps {
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

interface PropsWithNotFound extends BaseProps {
  NotFoundComponent?: React.ComponentType<
    React.PropsWithChildren<{ className?: string }>
  >;
}

export type DrawerProps = PropsWithNotFound;

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
      NotFoundComponent,
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
    // Update refs when the drawer is open and content is matched
    if (open && children) {
      lastChildrenRef.current = children;
      lastTitleRef.current = title;
    }

    return (
      <_Drawer
        onClose={(_, reason) => {
          if (onClose && reason !== 'backdropClick') {
            onClose({}, 'escapeKeyDown');
          }
        }}
        sx={{
          ...sxDrawer,
          ...sx,
        }}
        anchor="right"
        open={open}
        ref={ref}
        {...rest}
        aria-labelledby={titleID}
        data-qa-drawer
        data-testid="drawer"
        role="dialog"
      >
        <Grid
          sx={(theme) => ({
            '&&': {
              marginBottom: theme.spacing(2),
            },
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            position: 'relative',
          })}
          container
          wrap="nowrap"
        >
          <Grid>
            {isFetching ? null : (
              <Typography
                sx={(theme) => ({
                  marginRight: theme.spacing(2),
                  wordBreak: 'break-word',
                })}
                data-qa-drawer-title={title}
                data-testid="drawer-title"
                id={titleID}
                variant="h2"
              >
                {title}
              </Typography>
            )}
          </Grid>
          <Grid>
            <IconButton
              sx={{
                position: 'absolute',
                right: '-12px',
                top: '-12px',
              }}
              aria-label="Close drawer"
              color="primary"
              data-qa-close-drawer
              onClick={() => onClose?.({}, 'escapeKeyDown')}
              size="large"
            >
              <Close />
            </IconButton>
          </Grid>
        </Grid>
        {error ? (
          error === 'Not Found' && NotFoundComponent ? (
            <NotFoundComponent />
          ) : (
            <ErrorState
              errorText={Array.isArray(error) ? error[0].reason : error}
            />
          )
        ) : isFetching ? (
          <Box display="flex" justifyContent="center" mt={12}>
            <CircleProgress size="md" />
          </Box>
        ) : (
          children
        )}
      </_Drawer>
    );
  }
);
