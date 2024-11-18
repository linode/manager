import { Box, CircleProgress, IconButton } from '@linode/ui';
import Close from '@mui/icons-material/Close';
import _Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Typography } from 'src/components/Typography';
import { convertForAria } from 'src/utilities/stringUtils';

import type { DrawerProps } from '@mui/material/Drawer';
import type { Theme } from '@mui/material/styles';

interface Props extends DrawerProps {
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
export const Drawer = (props: Props) => {
  const { classes, cx } = useStyles();

  const { children, isFetching, onClose, open, title, wide, ...rest } = props;

  const titleID = convertForAria(title);
  const [closingTransition, setClosingTransition] = React.useState(false);

  const handleClose = () => {
    setClosingTransition(true);
  };

  const handleExited = (): void => {
    onClose?.({}, 'escapeKeyDown');
  };

  React.useEffect(() => {
    if (open) {
      setClosingTransition(false);
    }
  }, [open]);

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
          handleClose();
        }
      }}
      anchor="right"
      open={open && !closingTransition}
      {...rest}
      aria-labelledby={titleID}
      data-qa-drawer
      data-testid="drawer"
      onTransitionExited={handleExited}
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
            onClick={handleClose}
            size="large"
          >
            <Close />
          </IconButton>
        </Grid>
      </Grid>
      {isFetching ? (
        <Box display="flex" justifyContent="center" mt={8}>
          <CircleProgress size="md" />
        </Box>
      ) : (
        children
      )}
    </_Drawer>
  );
};

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
