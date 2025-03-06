import {
  Box,
  CircleProgress,
  ErrorState,
  IconButton,
  Typography,
  convertForAria,
} from '@linode/ui';
import Close from '@mui/icons-material/Close';
import _Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid2';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { NotFound } from './NotFound';

import type { APIError } from '@linode/api-v4';
import type { DrawerProps as _DrawerProps } from '@mui/material/Drawer';
import type { Theme } from '@mui/material/styles';

export interface DrawerProps extends _DrawerProps {
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
    const { classes, cx } = useStyles();
    const {
      children,
      error,
      isFetching,
      onClose,
      open,
      title,
      wide,
      ...rest
    } = props;
    const titleID = convertForAria(title);

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
        classes={{
          paper: cx(classes.common, {
            [classes.default]: !wide,
            [classes.wide]: wide,
          }),
        }}
        onClose={(_, reason) => {
          if (onClose && reason !== 'backdropClick') {
            onClose({}, 'escapeKeyDown');
          }
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
          className={classes.drawerHeader}
          container
          wrap="nowrap"
          sx={{
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <Grid>
            {isFetching ? null : (
              <Typography
                className={classes.title}
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
          error === 'Not Found' ? (
            <NotFound />
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

const useStyles = makeStyles()((theme: Theme) => ({
  button: {
    '& :hover, & :focus': {
      backgroundColor: theme.palette.primary.main,
      color: theme.tokens.color.Neutrals.White,
    },
    '& > span': {
      padding: 2,
    },
    minHeight: 'auto',
    minWidth: 'auto',
    padding: 0,
  },
  common: {
    '& .actionPanel': {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: theme.spacing(),
    },
    '& .selectionCard': {
      flexBasis: '100%',
      maxWidth: '100%',
    },
    padding: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },
  default: {
    [theme.breakpoints.down('sm')]: {
      maxWidth: 445,
      width: '100%',
    },
    width: 480,
  },
  drawerHeader: {
    '&&': {
      marginBottom: theme.spacing(2),
    },
  },
  title: {
    marginRight: theme.spacing(4),
    wordBreak: 'break-word',
  },
  wide: {
    maxWidth: 700,
    width: '100%',
  },
}));
