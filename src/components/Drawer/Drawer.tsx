import * as React from 'react';

import { Typography, withStyles, WithStyles, Theme, StyleRulesCallback } from 'material-ui';
import Drawer, { DrawerProps } from 'material-ui/Drawer';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import Close from 'material-ui-icons/Close';

interface Props extends DrawerProps {
  title: string;
}

type ClassNames = 'drawer' | 'button';

const styles: StyleRulesCallback = (theme: Theme) => ({
  paper: {
    minWidth: '480px',
    padding: theme.spacing.unit * 4,
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
  const { title, classes, ...rest } = props;

  return (
    <Drawer
      anchor="right"
      {...rest}
      classes={{ paper: classes.paper }}
      ModalProps={{ BackdropProps: { invisible: true } }}
      >
      <Grid container justify="space-between" alignItems="center">
        <Grid item>
          <Typography variant="title">
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
    </Drawer>
  );
};

export default withStyles(styles, { withTheme: true })<Props>(DDrawer);
