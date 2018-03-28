import * as React from 'react';

import { withStyles, WithStyles, Theme, StyleRulesCallback } from 'material-ui';
import Drawer, { DrawerProps } from 'material-ui/Drawer';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';

interface Props extends DrawerProps {
  title: string;
}

type ClassNames = 'drawer' | 'button';

const styles: StyleRulesCallback = (theme: Theme) => ({
  paper: { minWidth: '480px' },
  button: {},
});

type CombinedProps = Props & WithStyles<ClassNames>;

const DDrawer: React.StatelessComponent<CombinedProps> = (props) => {
  const { title, classes, ...rest } = props;

  return (
    <Drawer anchor="right" {...rest} classes={{ paper: classes.paper }}>
      <Grid container>
        <Grid item xs={11}>{title}</Grid>
        <Grid item xs={2}>
          <Button
            variant="raised"
            color="secondary"
            onClick={props.onClose}
            className={classes.button}
          >
            x
          </Button>
        </Grid>
      </Grid>
    </Drawer>
  );
};

export default withStyles(styles, { withTheme: true })<Props>(DDrawer);
