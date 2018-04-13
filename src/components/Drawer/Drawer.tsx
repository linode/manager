import * as React from 'react';

import { Typography, withStyles, WithStyles, Theme, StyleRulesCallback } from 'material-ui';
import Drawer, { DrawerProps } from 'material-ui/Drawer';
import Grid from 'src/components/Grid';
import Button from 'material-ui/Button';
import Close from 'material-ui-icons/Close';

interface Props extends DrawerProps {
  title: string;
}

type ClassNames = 'drawer'
| 'button'
| 'drawerHeader'
| 'drawerContent';

const styles: StyleRulesCallback = (theme: Theme) => ({
  paper: {
    width: 300,
    padding: theme.spacing.unit * 4,
    [theme.breakpoints.up('sm')]: {
      width: 480,
    },
    '& .actionPanel': {
      paddingLeft: 0,
      paddingRight: 0,
      marginLeft: -8,
    },
    '& .selectionCard': {
      maxWidth: '100%',
      flexBasis: '100%',
    },
  },
  drawerHeader: {
    marginBottom: theme.spacing.unit * 2,
  },
  drawerContent: {
    marginBottom: theme.spacing.unit * 2,
  },
  button: {
    minWidth: 'auto',
    minHeight: 'auto',
    padding: 0,
    '& > span': {
      padding: 2,
    },
    '& :hover, & :focus': {
      color: 'white',
      backgroundColor: theme.palette.primary.main,
    },
  },
});

type CombinedProps = Props & WithStyles<ClassNames>;

const DDrawer: React.StatelessComponent<CombinedProps> = (props) => {
  const { title, classes, children, ...rest } = props;

  return (
    <Drawer
      anchor="right"
      {...rest}
      classes={{ paper: classes.paper }}
      ModalProps={{
        BackdropProps: { invisible: true },
        disableBackdropClick: true,
      }}
      >
      <Grid
        container
        justify="space-between"
        alignItems="center"
        className={classes.drawerHeader}>
        <Grid item>
          <Typography variant="title" data-qa-drawer-title>
            {title}
          </Typography>
        </Grid>
        <Grid item>
          <Button
            variant="raised"
            color="secondary"
            onClick={props.onClose}
            className={classes.button}
          >
          <Close />
          </Button>
        </Grid>
      </Grid>
      {children}
    </Drawer>
  );
};

export default withStyles(styles, { withTheme: true })<Props>(DDrawer);
