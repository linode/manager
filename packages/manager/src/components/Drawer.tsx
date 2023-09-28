import Close from '@mui/icons-material/Close';
import _Drawer, { DrawerProps } from '@mui/material/Drawer';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { IconButton } from 'src/components/IconButton';
import { Typography } from 'src/components/Typography';
import { convertForAria } from 'src/utilities/stringUtils';

interface Props extends DrawerProps {
  /**
   * Title that appears at the top of the drawer
   */
  title: string;
  /**
   * Increaces the Drawers width from 480px to 700px on desktop-sized viewports
   * @default false
   */
  wide?: boolean;
}

const useStyles = makeStyles()((theme: Theme) => ({
  button: {
    '& :hover, & :focus': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
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
    wordBreak: 'break-word',
  },
  wide: {
    maxWidth: 700,
    width: '100%',
  },
}));

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
export const Drawer = (props: Props) => {
  const { classes, cx } = useStyles();

  const { children, onClose, title, wide, ...rest } = props;

  const titleID = convertForAria(title);

  return (
    <_Drawer
      classes={{
        paper: cx(classes.common, {
          [classes.default]: !wide,
          [classes.wide]: wide,
        }),
      }}
      onClose={(event, reason) => {
        if (onClose && reason !== 'backdropClick') {
          onClose(event, reason);
        }
      }}
      anchor="right"
      {...rest}
      aria-labelledby={titleID}
      data-qa-drawer
      data-testid="drawer"
      role="dialog"
    >
      <Grid
        sx={{
          position: 'relative',
        }}
        alignItems="flex-start"
        className={classes.drawerHeader}
        container
        justifyContent="space-between"
        wrap="nowrap"
      >
        <Grid>
          <Typography
            className={classes.title}
            data-qa-drawer-title={title}
            data-testid="drawer-title"
            id={titleID}
            variant="h2"
          >
            {title}
          </Typography>
        </Grid>
        <Grid>
          <IconButton
            sx={{
              right: '-12px',
              top: '-12px',
            }}
            aria-label="Close drawer"
            color="primary"
            data-qa-close-drawer
            onClick={onClose as (e: any) => void}
            size="large"
          >
            <Close />
          </IconButton>
        </Grid>
      </Grid>
      {children}
    </_Drawer>
  );
};
