import Close from '@mui/icons-material/Close';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { IconButton } from 'src/components/IconButton';
import { Typography } from 'src/components/Typography';
import _Drawer, { DrawerProps } from 'src/components/core/Drawer';
import { convertForAria } from 'src/utilities/stringUtils';

export interface Props extends DrawerProps {
  title: string;
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
  drawerHeader: {
    '&&': {
      marginBottom: theme.spacing(2),
    },
  },
  paper: {
    '& .actionPanel': {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: theme.spacing(),
    },
    '& .selectionCard': {
      flexBasis: '100%',
      maxWidth: '100%',
    },
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(4),
      width: 480,
    },
    width: 300,
  },
  title: {
    wordBreak: 'break-word',
  },
  wide: {
    [theme.breakpoints.up('sm')]: {
      width: 700,
    },
  },
}));

const Drawer = (props: Props) => {
  const { classes } = useStyles();

  const { children, onClose, title, wide, ...rest } = props;

  const titleID = convertForAria(title);

  return (
    <_Drawer
      onClose={(event, reason) => {
        if (onClose && reason !== 'backdropClick') {
          onClose(event, reason);
        }
      }}
      anchor="right"
      classes={{ paper: `${classes.paper} ${wide ? classes.wide : ''}` }}
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
              position: 'absolute',
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

export default Drawer;
